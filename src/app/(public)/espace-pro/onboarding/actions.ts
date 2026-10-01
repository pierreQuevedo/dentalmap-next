'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { updateTag } from 'next/cache'
import { sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { detientLaFiche, ficheAttribuee, getFicheParSlug } from '@/lib/espace-pro/revendication'
import { envoyerFichePubliee } from '@/lib/email'
import { cheminPraticien, nomAffiche } from '@/lib/annuaire/types'
import {
  NB_ETAPES,
  schemaAccessibilite,
  schemaHoraires,
  schemaLangues,
  schemaPaiement,
} from '@/lib/espace-pro/fiche-completee'

export type ResultatEtape = { ok: true } | { ok: false; erreur: string }

/**
 * Un tableau JavaScript passé tel quel en paramètre n'est pas compris comme un
 * `text[]` par le pilote HTTP de Neon. On passe par JSON, que Postgres sait
 * redéployer en tableau.
 */
function tableauTexte(valeurs: string[]): SQL {
  return sql`ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(valeurs)}::jsonb))::text[]`
}

/**
 * Enregistre une étape du parcours d'accueil.
 *
 * Chaque appel revérifie que le compte connecté détient une revendication
 * acceptée sur la fiche : l'interface cache les formulaires aux autres, mais
 * c'est ici que l'accès se décide. Les données sont validées avec les mêmes
 * schémas que le formulaire, et rien d'autre que les colonnes de l'étape n'est
 * touché, ce qui permet de revenir sur une étape sans effacer les autres.
 *
 * `terminer` marque la fin du parcours ; il n'est vrai qu'à la dernière étape.
 */
export async function enregistrerEtape(
  slug: string,
  etape: number,
  donnees: unknown,
  terminer = false,
): Promise<ResultatEtape> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, erreur: 'Votre session a expiré. Reconnectez-vous pour continuer.' }

  const fiche = await getFicheParSlug(slug)
  if (!fiche) return { ok: false, erreur: 'Fiche introuvable.' }
  if (!(await detientLaFiche(session.user.id, fiche.id))) {
    return { ok: false, erreur: 'Cette fiche ne vous est pas attribuée.' }
  }
  if (!Number.isInteger(etape) || etape < 1 || etape > NB_ETAPES) return { ok: false, erreur: 'Étape inconnue.' }

  let colonnes: SQL
  switch (etape) {
    case 1: {
      const r = schemaHoraires.safeParse(donnees)
      if (!r.success) return { ok: false, erreur: premierMessage(r.error) }
      // Un jour sans plage n'est pas stocké : fermé se lit par l'absence.
      const horaires = Object.fromEntries(Object.entries(r.data).filter(([, p]) => p && p.length > 0))
      colonnes = sql`horaires = ${JSON.stringify(horaires)}::jsonb`
      break
    }
    case 2: {
      const r = schemaLangues.safeParse(donnees)
      if (!r.success) return { ok: false, erreur: premierMessage(r.error) }
      colonnes = sql`langues = ${tableauTexte(r.data.langues)}`
      break
    }
    case 3: {
      const r = schemaAccessibilite.safeParse(donnees)
      if (!r.success) return { ok: false, erreur: premierMessage(r.error) }
      colonnes = sql`accessibilite = ${tableauTexte(r.data.accessibilite)}, accessibilite_commentaire = ${r.data.commentaire || null}`
      break
    }
    default: {
      const r = schemaPaiement.safeParse(donnees)
      if (!r.success) return { ok: false, erreur: premierMessage(r.error) }
      colonnes = sql`paiements = ${tableauTexte(r.data.paiements)}, tiers_payant = ${r.data.tiersPayant}`
    }
  }

  const termineLe = terminer && etape === NB_ETAPES ? sql`now()` : sql`fiches_completees.termine_le`

  await db.execute(sql`
    INSERT INTO fiches_completees (id, praticien_id, user_id, etape)
    VALUES (${randomUUID()}, ${fiche.id}, ${session.user.id}::uuid, 0)
    ON CONFLICT (praticien_id) DO NOTHING
  `)
  await db.execute(sql`
    UPDATE fiches_completees
    SET ${colonnes},
        etape = GREATEST(etape, ${etape}),
        termine_le = ${termineLe},
        user_id = ${session.user.id}::uuid,
        updated_at = now()
    WHERE praticien_id = ${fiche.id}
  `)

  updateTag(`praticien:${slug}`)

  if (terminer && etape === NB_ETAPES) {
    await auth.api.updateUser({ headers: await headers(), body: { etapeTunnel: 'tableau-de-bord' } })
    // Publiée seulement si la fiche est attribuée ; sinon l'email partira à l'acceptation.
    if (await ficheAttribuee(fiche.id)) {
      const base = fiche.profession === 'dentiste' ? 'dentistes' : 'prothesistes'
      const lien = fiche.communeSlug && fiche.departementSlug ? cheminPraticien(base, fiche.departementSlug, fiche.communeSlug, fiche.slug) : '/espace-pro/'
      await envoyerFichePubliee(session.user.email, nomAffiche(fiche), lien)
    }
  }
  return { ok: true }
}

function premierMessage(erreur: { issues: { message: string }[] }): string {
  return erreur.issues[0]?.message ?? 'Saisie invalide.'
}
