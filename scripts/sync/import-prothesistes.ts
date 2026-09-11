/**
 * Importe les laboratoires de prothèse dentaire.
 *
 * Usage :
 *   pnpm sync:prothesistes            import réel
 *   pnpm sync:prothesistes --simule   compte et classe, n'écrit rien
 *
 * Variables :
 *   PROTHESISTES_FICHIER  chemin du CSV source (défaut : ../sources/prothesistes.csv)
 *   PROTHESISTES_SIRENE   cache des appariements Sirene, au format JSONL
 *
 * Pourquoi un fichier et non un registre : les prothésistes dentaires ne
 * figurent dans aucun registre nominatif. Ils sont absents de l'Annuaire Santé,
 * ce n'est pas une profession de santé au sens du RPPS, et le code NAF 32.50A
 * couvre plus de 10 000 entreprises dont l'essentiel est hors sujet. La source
 * est donc une liste fournie, dont chaque ligne est ensuite confrontée à Sirene.
 *
 * Ce qui est publié vient de Sirene quand l'appariement aboutit. Trois niveaux
 * de confiance, matérialisés par `statut_verification` :
 *   - `verifie`     : trouvé par le nom, NAF dentaire, candidat unique
 *   - `partiel`     : trouvé par l'adresse seule, ou plusieurs candidats
 *   - `non_verifie` : introuvable dans Sirene
 *
 * Seuls les laboratoires `verifie` et disposant d'un établissement ouvert sont
 * indexables. Les autres restent consultables mais hors sitemap et en noindex.
 */
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { praticiens, lieuxExercice, verifications } from '@/db/schema'
import { encadrer } from './lib/run'
import { recalculerIndexables } from './lib/indexable'
import { slugifier } from './lib/slug'

const LOT = 500
const SEUIL_SIMILARITE = 0.6
const simule = process.argv.includes('--simule')

type LigneSource = {
  nom: string
  adresse: string
  codePostal: string
  ville: string
  telephone: string
}

type Appariement = {
  cle: string
  siren: string | null
  nom_sirene: string | null
  naf: string | null
  etablissements_ouverts: number | null
  strategie: string | null
  similarite: number | null
  nb_candidats: number | null
}

/** Découpage CSV tolérant aux guillemets et aux virgules dans les champs. */
function decouper(ligne: string): string[] {
  const out: string[] = []
  let courant = ''
  let dansGuillemets = false
  for (let i = 0; i < ligne.length; i++) {
    const ch = ligne[i]
    if (ch === '"') {
      if (dansGuillemets && ligne[i + 1] === '"') {
        courant += '"'
        i++
      } else dansGuillemets = !dansGuillemets
    } else if (ch === ',' && !dansGuillemets) {
      out.push(courant)
      courant = ''
    } else courant += ch
  }
  out.push(courant)
  return out
}

function lireSource(chemin: string): LigneSource[] {
  const lignes = readFileSync(chemin, 'utf8').split('\n').filter(Boolean)
  const entete = decouper(lignes[0]!).map((h) => h.trim())
  const idx = (nom: string) => entete.indexOf(nom)
  const iNom = idx('Nom')
  const iAdr = idx('Adresse')
  const iCp = idx('Code postal')
  const iVille = idx('Ville')
  const iTel = idx('Téléphone(s)')
  return lignes.slice(1).map((l) => {
    const c = decouper(l)
    return {
      nom: (c[iNom] ?? '').trim(),
      adresse: (c[iAdr] ?? '').trim(),
      codePostal: (c[iCp] ?? '').trim(),
      ville: (c[iVille] ?? '').trim(),
      telephone: (c[iTel] ?? '').trim(),
    }
  })
}

function lireAppariements(chemin: string): Map<string, Appariement> {
  if (!existsSync(chemin)) return new Map()
  const m = new Map<string, Appariement>()
  for (const l of readFileSync(chemin, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l) as Appariement
    m.set(r.cle, r)
  }
  return m
}

/** Empreinte stable d'un laboratoire sans SIREN, pour lui donner un identifiant. */
function empreinte(l: LigneSource): string {
  return createHash('sha1').update(`${l.nom}|${l.codePostal}`).digest('hex').slice(0, 10)
}

type Classement = { statut: 'verifie' | 'partiel' | 'non_verifie'; ouvert: boolean }

/**
 * Classe un laboratoire selon la solidité de son appariement.
 *
 * Un rapprochement obtenu par l'adresse seule est volontairement dégradé en
 * `partiel` : deux entreprises différentes partagent souvent une adresse, et
 * publier une identité fausse serait pire que de ne rien publier.
 */
function classer(a: Appariement | undefined): Classement {
  if (!a?.siren) return { statut: 'non_verifie', ouvert: false }
  const ouvert = (a.etablissements_ouverts ?? 0) > 0
  const parAdresse = a.strategie === 'adresse_cp'
  const ambigu = (a.nb_candidats ?? 1) > 1
  const nomProche = a.similarite === null || a.similarite === undefined || a.similarite >= SEUIL_SIMILARITE
  const sur = !parAdresse && !ambigu && nomProche
  return { statut: sur ? 'verifie' : 'partiel', ouvert }
}

async function principal() {
  await encadrer('import', async (run) => {
    const racine = join(process.cwd(), '..', 'sources')
    const fichier = process.env.PROTHESISTES_FICHIER ?? join(racine, 'prothesistes.csv')
    const cacheSirene = process.env.PROTHESISTES_SIRENE ?? join(racine, 'prothesistes-sirene.jsonl')

    const source = lireSource(fichier)
    const appariements = lireAppariements(cacheSirene)
    run.compteurs.lignesLues = source.length
    console.log(`[import] ${source.length} laboratoires lus, ${appariements.size} appariements Sirene en cache`)

    const bilan = { verifie: 0, partiel: 0, non_verifie: 0, fermes: 0, indexables: 0 }
    const vus = new Set<string>()
    const rows: {
      praticien: typeof praticiens.$inferInsert
      lieu: typeof lieuxExercice.$inferInsert
      verif: typeof verifications.$inferInsert | null
    }[] = []

    for (const l of source) {
      if (!l.nom) continue
      const a = appariements.get(`${l.nom}|${l.codePostal}`)
      const { statut, ouvert } = classer(a)
      bilan[statut] += 1
      if (a?.siren && !ouvert) bilan.fermes += 1

      const id = a?.siren ? `siren:${a.siren}` : `lab:${empreinte(l)}`
      // Plusieurs lignes peuvent partager un SIREN : c'est une même entreprise
      // sur plusieurs sites. On ne crée le praticien qu'une fois, mais on garde
      // chaque adresse distincte comme lieu d'exercice.
      const premiereApparition = !vus.has(id)
      vus.add(id)

      // Valeur initiale ; la colonne est de toute façon recalculée en fin de job
      // par `recalculerIndexables`, qui détient la règle.
      const indexable = statut === 'verifie' && ouvert
      if (premiereApparition && indexable) bilan.indexables += 1

      const raison = a?.nom_sirene || l.nom
      const suffixe = a?.siren ? a.siren.slice(-4) : empreinte(l).slice(0, 4)
      rows.push({
        praticien: {
          id,
          profession: 'prothesiste',
          slug: `${slugifier(raison)}-${suffixe}`,
          nom: raison,
          raisonSociale: raison,
          siren: a?.siren ?? null,
          statutVerification: statut,
          indexable,
        },
        lieu: {
          id: `${id}:${createHash('sha1').update(`${l.adresse}|${l.codePostal}`).digest('hex').slice(0, 10)}`,
          praticienId: id,
          adresseLigne: l.adresse || null,
          codePostal: l.codePostal || null,
          telephoneOfficiel: l.telephone.split('/')[0]?.trim() || null,
          principal: premiereApparition,
        },
        verif: a?.siren
          ? {
              id: `${id}:sirene`,
              praticienId: id,
              registre: 'sirene',
              statut: ouvert ? 'verifie' : 'cesse',
              syncRunId: run.id,
            }
          : null,
      })
    }

    console.log(
      `[import] classement : ${bilan.verifie} vérifiés, ${bilan.partiel} partiels, ` +
        `${bilan.non_verifie} non vérifiés, dont ${bilan.fermes} sans établissement ouvert`,
    )
    const praticiensDistincts = new Set(rows.map((r) => r.praticien.id)).size
    console.log(
      `[import] ${praticiensDistincts} laboratoires distincts pour ${rows.length} adresses, ` +
        `${bilan.indexables} indexables, ${praticiensDistincts - bilan.indexables} hors index`,
    )

    if (simule) {
      console.log('[import] SIMULATION : aucune écriture')
      return { simule: true, ...bilan, laboratoires: praticiensDistincts, adresses: rows.length }
    }

    for (let i = 0; i < rows.length; i += LOT) {
      const lot = rows.slice(i, i + LOT)
      // Dédoublonnage intra-lot : un même SIREN peut apparaître deux fois.
      const praticiensLot = [...new Map(lot.map((r) => [r.praticien.id, r.praticien])).values()]
      await db
        .insert(praticiens)
        .values(praticiensLot)
        .onConflictDoUpdate({
          target: praticiens.id,
          set: {
            nom: sql`excluded.nom`,
            raisonSociale: sql`excluded.raison_sociale`,
            siren: sql`excluded.siren`,
            statutVerification: sql`excluded.statut_verification`,
            indexable: sql`excluded.indexable`,
            updatedAt: sql`now()`,
            // slug volontairement absent : écrit une fois pour toutes.
          },
        })
      // Postgres refuse qu'un ON CONFLICT touche deux fois la même ligne : deux
      // entrées de la source peuvent viser le même couple laboratoire et adresse.
      const lieuxLot = [...new Map(lot.map((r) => [r.lieu.id, r.lieu])).values()]
      await db
        .insert(lieuxExercice)
        .values(lieuxLot)
        .onConflictDoUpdate({
          target: lieuxExercice.id,
          set: {
            adresseLigne: sql`excluded.adresse_ligne`,
            codePostal: sql`excluded.code_postal`,
            telephoneOfficiel: sql`excluded.telephone_officiel`,
          },
        })
      const verifs = [
        ...new Map(
          (lot.map((r) => r.verif).filter(Boolean) as (typeof verifications.$inferInsert)[]).map((v) => [v.id, v]),
        ).values(),
      ]
      if (verifs.length > 0) {
        await db
          .insert(verifications)
          .values(verifs)
          .onConflictDoUpdate({
            target: [verifications.praticienId, verifications.registre],
            set: { statut: sql`excluded.statut`, verifieLe: sql`now()`, syncRunId: sql`excluded.sync_run_id` },
          })
      }
      run.compteurs.inserees += lot.length
    }

    const idx = await recalculerIndexables()
    console.log(`[import] ${praticiensDistincts} laboratoires et ${rows.length} adresses écrits`)
    console.log(`[import] ${idx.indexables}/${idx.total} praticiens indexables toutes professions confondues`)
    return { ...bilan, laboratoires: praticiensDistincts, adresses: rows.length }
  })
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
