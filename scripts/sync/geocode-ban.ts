/**
 * Attribue une position aux lieux d'exercice, via l'API Adresse (BAN).
 *
 * Usage : pnpm sync:geocode          les lieux sans position
 *         pnpm sync:geocode --tout   retraite aussi les lieux déjà positionnés
 *
 * Trois passes successives, de la plus précise à la moins précise :
 *   1. adresse complète avec code postal et commune ;
 *   2. adresse sans numéro de voie, pour les numéros introuvables ;
 *   3. centroïde de la commune, marqué `position_approximative`.
 *
 * Le code commune est repris du résultat BAN (`result_citycode`) et non de la
 * colonne de l'Annuaire Santé : c'est ce qui résout les communes fusionnées,
 * Veneux-les-Sablons devenant Moret-Loing-et-Orvanne, ainsi que les lieux
 * dépourvus de code commune dans le fichier source.
 *
 * Un score inférieur au seuil est traité comme un échec et passe à la stratégie
 * suivante : mieux vaut un centroïde assumé qu'une position fausse.
 */
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { encadrer } from './lib/run'
import { recalculerIndexables } from './lib/indexable'

const SEUIL_SCORE = 0.6
const LOT = 1000
const BAN = 'https://api-adresse.data.gouv.fr/search/csv/'
/**
 * L'API Adresse ferme la connexion au bout de quelques dizaines de requêtes
 * rapprochées, ce qui remonte en `SocketError: other side closed`. Une pause
 * entre les lots et quelques tentatives suffisent : sur 59 000 lieux le job
 * dure quelques minutes de plus, ce qui est sans importance pour un import.
 */
const PAUSE_ENTRE_LOTS_MS = 300
const TENTATIVES = 5

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

const tout = process.argv.includes('--tout')

type Lieu = {
  id: string
  adresse_ligne: string | null
  code_postal: string | null
  libelle_commune: string | null
  code_insee: string | null
}

type Resultat = { id: string; lon: number; lat: number; score: number; citycode: string | null }

function echapper(v: string): string {
  return `"${v.replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`
}

/** Envoie un lot au géocodage de masse et rend les résultats exploitables. */
async function geocoder(lignes: { id: string; adresse: string; cp: string; ville: string }[]): Promise<Resultat[]> {
  const csv = [
    'id,adresse,codepostal,ville',
    ...lignes.map((l) => [echapper(l.id), echapper(l.adresse), echapper(l.cp), echapper(l.ville)].join(',')),
  ].join('\n')

  const form = new FormData()
  form.append('data', new Blob([csv], { type: 'text/csv' }), 'lot.csv')
  form.append('columns', 'adresse')
  form.append('columns', 'codepostal')
  form.append('columns', 'ville')
  form.append('postcode', 'codepostal')

  let texte = ''
  for (let tentative = 1; ; tentative++) {
    try {
      const res = await fetch(BAN, { method: 'POST', body: form })
      if (!res.ok) throw new Error(`API Adresse ${res.status} ${res.statusText}`)
      texte = await res.text()
      break
    } catch (e) {
      if (tentative >= TENTATIVES) throw e
      const attente = 1000 * 2 ** (tentative - 1)
      console.warn(
        `[ban] tentative ${tentative}/${TENTATIVES} échouée (${e instanceof Error ? e.message : e}), ` +
          `nouvelle tentative dans ${attente} ms`,
      )
      await pause(attente)
    }
  }

  const [entete, ...corps] = texte.split('\n').filter(Boolean)
  const cols = decouper(entete)
  const iId = cols.indexOf('id')
  const iLon = cols.indexOf('longitude')
  const iLat = cols.indexOf('latitude')
  const iScore = cols.indexOf('result_score')
  const iCity = cols.indexOf('result_citycode')

  const sortie: Resultat[] = []
  for (const ligne of corps) {
    const c = decouper(ligne)
    const lon = Number.parseFloat(c[iLon] ?? '')
    const lat = Number.parseFloat(c[iLat] ?? '')
    const score = Number.parseFloat(c[iScore] ?? '')
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || !(score >= SEUIL_SCORE)) continue
    sortie.push({ id: c[iId] ?? '', lon, lat, score, citycode: c[iCity] || null })
  }
  return sortie
}

/** Découpage CSV minimal : les champs peuvent être entre guillemets et contenir des virgules. */
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

/** Écrit les positions trouvées, en une requête par lot. */
async function ecrire(resultats: Resultat[], approximative: boolean): Promise<number> {
  if (resultats.length === 0) return 0
  const valeurs = sql.join(
    resultats.map(
      (r) =>
        sql`(${r.id}, ST_SetSRID(ST_MakePoint(${r.lon}, ${r.lat}), 4326), ${r.score}::real, ${r.citycode})`,
    ),
    sql`, `,
  )
  await db.execute(sql`
    UPDATE lieux_exercice l SET
      position = v.position,
      score_geocodage = v.score,
      position_approximative = ${approximative},
      code_insee = COALESCE(
        (SELECT c.code_insee FROM communes c WHERE c.code_insee = v.citycode),
        l.code_insee
      )
    FROM (VALUES ${valeurs}) AS v(id, position, score, citycode)
    WHERE l.id = v.id
  `)
  return resultats.length
}

async function principal() {
  await encadrer('ban', async (run) => {
    const filtre = tout ? sql`TRUE` : sql`l.position IS NULL`
    const { rows: lieux } = await db.execute<Lieu>(sql`
      SELECT l.id, l.adresse_ligne, l.code_postal,
             COALESCE(c.nom, '') AS libelle_commune, l.code_insee
      FROM lieux_exercice l
      LEFT JOIN communes c ON c.code_insee = l.code_insee
      WHERE ${filtre}
    `)
    run.compteurs.lignesLues = lieux.length
    console.log(`[ban] ${lieux.length} lieux à traiter`)

    const restants = new Map(lieux.map((l) => [l.id, l]))
    let precis = 0

    // Passe 1 : adresse complète.
    for (let i = 0; i < lieux.length; i += LOT) {
      const lot = lieux
        .slice(i, i + LOT)
        .filter((l) => l.adresse_ligne && l.code_postal)
        .map((l) => ({ id: l.id, adresse: l.adresse_ligne!, cp: l.code_postal!, ville: l.libelle_commune ?? '' }))
      if (lot.length === 0) continue
      const res = await geocoder(lot)
      precis += await ecrire(res, false)
      for (const r of res) restants.delete(r.id)
      if (i % (LOT * 5) === 0) console.log(`[ban] passe 1 : ${i + lot.length}/${lieux.length}`)
      await pause(PAUSE_ENTRE_LOTS_MS)
    }
    console.log(`[ban] passe 1 terminée, ${precis} positions précises`)

    // Passe 2 : adresse sans numéro de voie.
    const pourPasse2 = [...restants.values()].filter((l) => l.adresse_ligne && l.code_postal)
    let sansNumero = 0
    for (let i = 0; i < pourPasse2.length; i += LOT) {
      const lot = pourPasse2.slice(i, i + LOT).map((l) => ({
        id: l.id,
        adresse: l.adresse_ligne!.replace(/^\d+\s*(bis|ter|quater)?\s*/i, '').trim(),
        cp: l.code_postal!,
        ville: l.libelle_commune ?? '',
      }))
      const aGeocoder = lot.filter((l) => l.adresse)
      if (aGeocoder.length === 0) continue
      const res = await geocoder(aGeocoder)
      sansNumero += await ecrire(res, false)
      for (const r of res) restants.delete(r.id)
      await pause(PAUSE_ENTRE_LOTS_MS)
    }
    console.log(`[ban] passe 2 terminée, ${sansNumero} positions supplémentaires sans numéro`)

    // Passe 3 : centroïde de la commune, position assumée comme approximative.
    const { rows } = await db.execute<{ n: number }>(sql`
      UPDATE lieux_exercice l SET
        position = c.centre,
        position_approximative = TRUE,
        score_geocodage = NULL
      FROM communes c
      WHERE l.code_insee = c.code_insee AND l.position IS NULL AND c.centre IS NOT NULL
      RETURNING 1 AS n
    `)
    const centroides = rows.length
    console.log(`[ban] passe 3 terminée, ${centroides} positions au centroïde de commune`)

    run.compteurs.modifiees = precis + sansNumero + centroides

    const idx = await recalculerIndexables()
    console.log(`[ban] ${idx.indexables}/${idx.total} praticiens indexables`)

    const [bilan] = (
      await db.execute<{ total: number; positionnes: number; precis: number }>(sql`
        SELECT count(*)::int AS total,
               count(position)::int AS positionnes,
               count(*) FILTER (WHERE position IS NOT NULL AND NOT position_approximative)::int AS precis
        FROM lieux_exercice
      `)
    ).rows
    const taux = bilan && bilan.total > 0 ? (bilan.positionnes / bilan.total) * 100 : 0
    const tauxPrecis = bilan && bilan.total > 0 ? (bilan.precis / bilan.total) * 100 : 0
    console.log(
      `[ban] ${bilan?.positionnes}/${bilan?.total} lieux positionnés (${taux.toFixed(1)} %), ` +
        `dont ${tauxPrecis.toFixed(1)} % en position précise`,
    )
    return { taux, tauxPrecis }
  })
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
