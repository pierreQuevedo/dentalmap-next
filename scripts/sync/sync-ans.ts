/**
 * Importe les chirurgiens-dentistes depuis l'extraction en libre accès de
 * l'Annuaire Santé.
 *
 * Usage :
 *   pnpm sync:ans            import réel
 *   pnpm sync:ans --simule   parcourt et compte, n'écrit rien en base
 *
 * Variables optionnelles :
 *   ANS_FICHIER   chemin d'un fichier déjà téléchargé, pour éviter 780 Mo de transfert
 *   ANS_FORCE     à « 1 » pour réimporter même si la source n'a pas changé
 *
 * Règles appliquées, toutes issues du document d'architecture :
 *   - le slug est écrit à la première insertion et n'est jamais recalculé, même
 *     si le praticien change de nom : il fait partie de l'URL publique ;
 *   - un praticien absent du fichier n'est pas supprimé, `deleted_at` est
 *     renseigné et sa page basculera en 410 ;
 *   - un run qui supprimerait plus de 5 % de l'effectif n'applique rien et
 *     s'arrête en statut `bloque`, protection contre un fichier tronqué.
 */
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { sql, eq, isNull, and, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { praticiens, lieuxExercice } from '@/db/schema'
import { encadrer } from './lib/run'
import { slugifier } from './lib/slug'
import { lireAns, PROFESSION_DENTISTE, type LigneAns } from './lib/ans'
import { assurerSource, ressourceDataGouv } from './lib/source'

const DATASET = 'annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps'
const RESOURCE = 'fffda7e9-0ea2-4c35-bba0-4496f3af935d'
const SEUIL_SUPPRESSION = 0.05
const LOT = 500

const simule = process.argv.includes('--simule')

type Praticien = {
  id: string
  rpps: string
  nom: string
  prenom: string
  siren: string
  siret: string
  raisonSociale: string
}

type Lieu = {
  id: string
  praticienId: string
  adresseLigne: string
  codePostal: string
  codeCommune: string
  telephone: string
  principal: boolean
}

/**
 * Slug d'un dentiste : `dr-prenom-nom-1742`.
 *
 * Les quatre derniers chiffres du RPPS départagent les homonymes de façon
 * stable, sans dépendre de l'ordre d'import.
 */
function slugPraticien(p: Praticien): string {
  const base = ['dr', p.prenom, p.nom].filter(Boolean).map(slugifier).filter(Boolean).join('-')
  return `${base}-${p.rpps.slice(-4)}`
}

/**
 * Identifiant stable d'un lieu d'exercice.
 *
 * L'identifiant technique de structure n'est présent que sur 59 295 lignes sur
 * 75 218, et 183 couples (praticien, structure) apparaissent en double. On
 * complète donc par une empreinte de l'adresse, ce qui rend la clé stable d'un
 * import à l'autre sans dépendre du rang de la ligne dans le fichier.
 */
function idLieu(l: LigneAns): string {
  const discriminant = createHash('sha1')
    .update(`${l.identifiantStructure}|${l.adresseLigne}|${l.codePostal}|${l.codeCommune}`)
    .digest('hex')
    .slice(0, 12)
  return `${l.identifiantNational}:${discriminant}`
}

async function principal() {
  await encadrer('ans', async (run) => {
    const ressource = await ressourceDataGouv(DATASET, RESOURCE)
    const chemin = process.env.ANS_FICHIER ?? join(tmpdir(), 'ps-libreacces-personne-activite.txt')
    const snapshot = await assurerSource('ans', ressource, chemin)

    if (snapshot.inchange && process.env.ANS_FORCE !== '1') {
      console.log('[ans] la source publiée est identique au dernier import, rien à faire')
      return { inchange: true }
    }

    // 1. Parcours du fichier, regroupement par praticien.
    const parPraticien = new Map<string, Praticien>()
    const parLieu = new Map<string, Lieu>()
    let lignesRetenues = 0

    for await (const l of lireAns(chemin, PROFESSION_DENTISTE, () => { run.compteurs.lignesLues += 1 })) {
      lignesRetenues += 1
      if (!parPraticien.has(l.identifiantNational)) {
        parPraticien.set(l.identifiantNational, {
          id: l.identifiantNational,
          rpps: l.rpps,
          nom: l.nom,
          prenom: l.prenom,
          siren: l.siren,
          siret: l.siret,
          raisonSociale: l.raisonSociale,
        })
      }
      if (!l.adresseLigne && !l.codeCommune) continue
      const id = idLieu(l)
      if (!parLieu.has(id)) {
        parLieu.set(id, {
          id,
          praticienId: l.identifiantNational,
          adresseLigne: l.adresseLigne,
          codePostal: l.codePostal,
          codeCommune: l.codeCommune,
          telephone: l.telephone,
          principal: false,
        })
      }
    }

    // Le premier lieu rencontré pour un praticien est marqué principal.
    const vuPrincipal = new Set<string>()
    for (const lieu of parLieu.values()) {
      if (!vuPrincipal.has(lieu.praticienId)) {
        vuPrincipal.add(lieu.praticienId)
        lieu.principal = true
      }
    }

    console.log(
      `[ans] ${run.compteurs.lignesLues} lignes parcourues, ${lignesRetenues} de dentistes, ` +
        `${parPraticien.size} praticiens distincts, ${parLieu.size} lieux`,
    )

    // 2. Garde-fou : combien de praticiens présents en base disparaîtraient ?
    const enBase = await db
      .select({ id: praticiens.id })
      .from(praticiens)
      .where(and(eq(praticiens.profession, 'dentiste'), isNull(praticiens.deletedAt)))
    const disparus = enBase.filter((p) => !parPraticien.has(p.id)).map((p) => p.id)
    const part = enBase.length > 0 ? disparus.length / enBase.length : 0
    if (enBase.length > 0 && part > SEUIL_SUPPRESSION) {
      run.bloquer(
        `${disparus.length} praticiens disparaîtraient sur ${enBase.length} en base, ` +
          `soit ${(part * 100).toFixed(1)} %, au-delà du seuil de ${SEUIL_SUPPRESSION * 100} %`,
      )
    }

    if (simule) {
      console.log(
        `[ans] SIMULATION : aucune écriture. ${parPraticien.size} praticiens, ${parLieu.size} lieux, ` +
          `${disparus.length} disparitions (${(part * 100).toFixed(2)} %)`,
      )
      return { simule: true, praticiens: parPraticien.size, lieux: parLieu.size, disparus: disparus.length }
    }

    // 3. Écriture des praticiens. Le slug n'est jamais réécrit.
    const listePraticiens = [...parPraticien.values()]
    for (let i = 0; i < listePraticiens.length; i += LOT) {
      const lot = listePraticiens.slice(i, i + LOT)
      await db
        .insert(praticiens)
        .values(
          lot.map((p) => ({
            id: p.id,
            profession: 'dentiste' as const,
            slug: slugPraticien(p),
            nom: p.nom,
            prenom: p.prenom || null,
            raisonSociale: p.raisonSociale || null,
            rpps: p.rpps || null,
            siren: p.siren || null,
            siret: p.siret || null,
            statutVerification: 'verifie' as const,
            sourceSnapshotId: snapshot.id,
            deletedAt: null,
          })),
        )
        .onConflictDoUpdate({
          target: praticiens.id,
          set: {
            nom: sql`excluded.nom`,
            prenom: sql`excluded.prenom`,
            raisonSociale: sql`excluded.raison_sociale`,
            siren: sql`excluded.siren`,
            siret: sql`excluded.siret`,
            statutVerification: sql`excluded.statut_verification`,
            sourceSnapshotId: sql`excluded.source_snapshot_id`,
            updatedAt: sql`now()`,
            deletedAt: sql`null`,
            // slug volontairement absent : il est écrit une fois pour toutes.
          },
        })
      run.compteurs.inserees += lot.length
    }
    console.log(`[ans] ${listePraticiens.length} praticiens écrits`)

    // 4. Écriture des lieux. Le code commune n'est repris que s'il existe dans
    //    le référentiel : 45 codes du fichier correspondent à des communes
    //    fusionnées, que le géocodage BAN résoudra ensuite.
    const { rows: connues } = await db.execute<{ code_insee: string }>(sql`SELECT code_insee FROM communes`)
    const codesConnus = new Set(connues.map((c) => c.code_insee))
    let communesInconnues = 0

    const listeLieux = [...parLieu.values()]
    for (let i = 0; i < listeLieux.length; i += LOT) {
      const lot = listeLieux.slice(i, i + LOT)
      await db
        .insert(lieuxExercice)
        .values(
          lot.map((l) => {
            const codeOk = l.codeCommune && codesConnus.has(l.codeCommune)
            if (l.codeCommune && !codeOk) communesInconnues += 1
            return {
              id: l.id,
              praticienId: l.praticienId,
              adresseLigne: l.adresseLigne || null,
              codePostal: l.codePostal || null,
              codeInsee: codeOk ? l.codeCommune : null,
              telephoneOfficiel: l.telephone || null,
              principal: l.principal,
            }
          }),
        )
        .onConflictDoUpdate({
          target: lieuxExercice.id,
          set: {
            adresseLigne: sql`excluded.adresse_ligne`,
            codePostal: sql`excluded.code_postal`,
            codeInsee: sql`excluded.code_insee`,
            telephoneOfficiel: sql`excluded.telephone_officiel`,
            principal: sql`excluded.principal`,
          },
        })
      run.compteurs.modifiees += lot.length
    }
    console.log(`[ans] ${listeLieux.length} lieux écrits, ${communesInconnues} code(s) commune non résolus`)

    // 5. Marquage des disparus.
    for (let i = 0; i < disparus.length; i += LOT) {
      await db
        .update(praticiens)
        .set({ deletedAt: sql`now()`, indexable: false })
        .where(inArray(praticiens.id, disparus.slice(i, i + LOT)))
      run.compteurs.supprimees += Math.min(LOT, disparus.length - i)
    }
    if (disparus.length > 0) console.log(`[ans] ${disparus.length} praticiens marqués disparus`)

    // 6. Indexabilité provisoire : un praticien est indexable s'il a au moins un
    //    lieu avec une adresse. Le géocodage la resserrera ensuite sur les
    //    praticiens réellement positionnés.
    await db.execute(sql`
      UPDATE praticiens p SET indexable = EXISTS (
        SELECT 1 FROM lieux_exercice l
        WHERE l.praticien_id = p.id AND l.adresse_ligne IS NOT NULL
      )
      WHERE p.profession = 'dentiste' AND p.deleted_at IS NULL
    `)

    return { praticiens: listePraticiens.length, lieux: listeLieux.length, disparus: disparus.length }
  })
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
