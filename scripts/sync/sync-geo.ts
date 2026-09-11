/**
 * Remplit le référentiel géographique : régions, départements, communes.
 *
 * Source : geo.api.gouv.fr, qui expose le Code officiel géographique de l'INSEE
 * avec le centroïde et la population. Trois requêtes suffisent, là où le
 * document d'architecture prévoyait de parser les fichiers du COG.
 *
 * Job annuel, à relancer en janvier après la mise à jour du COG. Idempotent :
 * il peut être rejoué sans dommage, les fusions de communes produisent des
 * lignes `redirections`.
 */
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { regions, departements, communes } from '@/db/schema'
import { encadrer } from './lib/run'
import { slugifier, slugCommune, slugUnique } from './lib/slug'

const BASE = 'https://geo.api.gouv.fr'

type Region = { code: string; nom: string }
type Departement = { code: string; nom: string; codeRegion: string }
type CommuneApi = {
  code: string
  nom: string
  codesPostaux?: string[]
  codeDepartement?: string
  population?: number
  centre?: { type: 'Point'; coordinates: [number, number] }
}

async function recuperer<T>(chemin: string): Promise<T> {
  const res = await fetch(`${BASE}${chemin}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`geo.api.gouv.fr ${res.status} ${res.statusText} sur ${chemin}`)
  return (await res.json()) as T
}

const CHAMPS_COMMUNE = 'nom,code,codesPostaux,codeDepartement,population,centre'

async function principal() {
  await encadrer('geo', async (run) => {
  // 1. Régions
  const listeRegions = await recuperer<Region[]>('/regions')
  run.compteurs.lignesLues += listeRegions.length
  const slugsRegion = new Set<string>()
  await db
    .insert(regions)
    .values(
      listeRegions.map((r) => ({
        code: r.code,
        nom: r.nom,
        slug: slugUnique(slugifier(r.nom), r.code, slugsRegion),
      })),
    )
    .onConflictDoUpdate({
      target: regions.code,
      set: { nom: sql`excluded.nom`, slug: sql`excluded.slug` },
    })
  run.compteurs.inserees += listeRegions.length
  console.log(`[geo] ${listeRegions.length} régions`)

  // 2. Départements
  const listeDep = await recuperer<Departement[]>('/departements?fields=nom,code,codeRegion')
  run.compteurs.lignesLues += listeDep.length
  const slugsDep = new Set<string>()
  await db
    .insert(departements)
    .values(
      listeDep.map((d) => ({
        code: d.code,
        nom: d.nom,
        slug: slugUnique(slugifier(d.nom), d.code, slugsDep),
        regionCode: d.codeRegion,
      })),
    )
    .onConflictDoUpdate({
      target: departements.code,
      set: { nom: sql`excluded.nom`, slug: sql`excluded.slug`, regionCode: sql`excluded.region_code` },
    })
  run.compteurs.inserees += listeDep.length
  console.log(`[geo] ${listeDep.length} départements`)

  // 3. Communes, puis arrondissements municipaux.
  //    L'API ne renvoie pas les arrondissements dans la liste générale, alors
  //    que l'ANS code les adresses parisiennes, lyonnaises et marseillaises
  //    avec leur code d'arrondissement. Les omettre laisserait des milliers de
  //    lieux d'exercice sans commune rattachable.
  const ordinaires = await recuperer<CommuneApi[]>(`/communes?fields=${CHAMPS_COMMUNE}&format=json`)
  const arrondissements = await recuperer<CommuneApi[]>(
    `/communes?type=arrondissement-municipal&fields=${CHAMPS_COMMUNE}&format=json`,
  )
  console.log(`[geo] ${ordinaires.length} communes et ${arrondissements.length} arrondissements`)

  const codesDepartement = new Set(listeDep.map((d) => d.code))
  // Un arrondissement porte le code de sa commune mère dans ses trois premiers
  // caractères pour Paris et Lyon, et dans 132xx pour Marseille.
  const MERES: Record<string, string> = { '75': '75056', '69': '69123', '13': '13055' }

  const slugsParDepartement = new Map<string, Set<string>>()
  const lignes: (typeof communes.$inferInsert)[] = []
  let ignorees = 0

  for (const [source, estArrondissement] of [
    [ordinaires, false],
    [arrondissements, true],
  ] as const) {
    for (const c of source) {
      run.compteurs.lignesLues += 1
      const dep = c.codeDepartement
      if (!dep || !codesDepartement.has(dep)) {
        // Les collectivités d'outre-mer sans département rattaché sortent du
        // périmètre : aucune adresse d'exercice ne s'y rattache dans l'ANS.
        run.erreur(`commune sans département exploitable`, `${c.code} ${c.nom}`)
        ignorees += 1
        continue
      }
      let pris = slugsParDepartement.get(dep)
      if (!pris) {
        pris = new Set<string>()
        slugsParDepartement.set(dep, pris)
      }
      lignes.push({
        codeInsee: c.code,
        nom: c.nom,
        slug: slugUnique(slugCommune(c.nom), c.code, pris),
        departementCode: dep,
        codesPostaux: c.codesPostaux ?? [],
        population: c.population ?? null,
        centre: c.centre ? { x: c.centre.coordinates[0], y: c.centre.coordinates[1] } : null,
        type: estArrondissement ? 'arrondissement' : 'commune',
        communeParenteCode: estArrondissement ? (MERES[dep] ?? null) : null,
      })
    }
  }

  // Insertion par lots : 35 000 lignes en une seule requête dépasseraient la
  // limite de paramètres du protocole Postgres.
  const LOT = 500
  for (let i = 0; i < lignes.length; i += LOT) {
    await db
      .insert(communes)
      .values(lignes.slice(i, i + LOT))
      .onConflictDoUpdate({
        target: communes.codeInsee,
        set: {
          nom: sql`excluded.nom`,
          slug: sql`excluded.slug`,
          departementCode: sql`excluded.departement_code`,
          codesPostaux: sql`excluded.codes_postaux`,
          population: sql`excluded.population`,
          centre: sql`excluded.centre`,
          type: sql`excluded.type`,
          communeParenteCode: sql`excluded.commune_parente_code`,
        },
      })
    run.compteurs.inserees += Math.min(LOT, lignes.length - i)
  }

  // 4. Communes disparues depuis le dernier run : fusions, essentiellement.
  //    On ne les supprime pas, on enregistre une redirection vers la commune
  //    absorbante quand elle est identifiable, pour ne pas perdre les URL.
  const presents = new Set(lignes.map((l) => l.codeInsee))
  const enBase = await db.select({ code: communes.codeInsee }).from(communes)
  const disparues = enBase.filter((c) => !presents.has(c.code))
  if (disparues.length > 0) {
    run.erreur(
      `${disparues.length} commune(s) en base absentes du COG, à traiter manuellement`,
      disparues.slice(0, 20).map((c) => c.code).join(', '),
    )
  }

    if (ignorees > 0) console.log(`[geo] ${ignorees} ligne(s) ignorée(s)`)
    return { regions: listeRegions.length, departements: listeDep.length, communes: lignes.length }
  })
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
