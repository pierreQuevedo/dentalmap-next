'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { getCompte } from '@/lib/tunnel/compte'
import { ALERTES_MAX, RAYONS_ALERTE, lireFrequence } from './alertes-compte'
import { CODES_CONTRAT, CODES_METIER, type CodeContrat, type CodeMetier } from './metiers'

/**
 * Les alertes emploi d'un compte (CAND-ALERTES, OUV-C-ALERTE) : créer,
 * modifier, mettre en pause, supprimer. L'adresse du compte est déjà
 * confirmée : l'alerte est active dès sa création. Un compte connecté
 * suffit, avec ou sans fiche.
 */

export type EtatAlerte = { erreur?: string; champ?: string } | null

const PAGE = '/espace-pro/emploi/alertes/'

async function compte() {
  const c = await getCompte()
  if (!c) redirect(chemin(`/connexion/?retour=${encodeURIComponent(PAGE)}`))
  return c
}

export async function enregistrerAlerte(_: EtatAlerte, donnees: FormData): Promise<EtatAlerte> {
  const c = await compte()
  const id = String(donnees.get('alerte') ?? '') || null
  const metiers = [...new Set(donnees.getAll('metiers').map(String))].filter((m): m is CodeMetier => (CODES_METIER as readonly string[]).includes(m)).sort()
  const contrats = [...new Set(donnees.getAll('contrats').map(String))].filter((x): x is CodeContrat => (CODES_CONTRAT as readonly string[]).includes(x)).sort()
  const commune = String(donnees.get('commune') ?? '')
  const rayon = Number(donnees.get('rayon'))
  const titre = String(donnees.get('titre') ?? '').trim().slice(0, 80) || null
  const frequence = lireFrequence(donnees.get('frequence'))
  if (!/^[0-9AB]{5}$/.test(commune)) return { erreur: 'Choisissez une ville dans la liste.', champ: 'commune' }
  const criteres = { metiers, contrats, commune, rayonKm: (RAYONS_ALERTE as readonly number[]).includes(rayon) ? rayon : 15 }
  const json = JSON.stringify(criteres)

  if (id) {
    const { rows } = await db.execute<{ id: string }>(sql`
      UPDATE alertes_emploi SET criteres = ${json}::jsonb, titre = ${titre}, frequence = ${frequence}
      WHERE id = ${id} AND user_id = ${c.id}::uuid RETURNING id
    `)
    if (!rows[0]) return { erreur: 'Alerte introuvable.' }
  } else {
    const { rows } = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM alertes_emploi WHERE user_id = ${c.id}::uuid`)
    if ((rows[0]?.n ?? 0) >= ALERTES_MAX) return { erreur: `${ALERTES_MAX} alertes au plus : supprimez-en une pour en créer une autre.` }
    await db.execute(sql`
      INSERT INTO alertes_emploi (id, user_id, criteres, titre, frequence, confirmee_le, active)
      VALUES (${randomUUID()}, ${c.id}::uuid, ${json}::jsonb, ${titre}, ${frequence}, now(), true)
    `)
  }
  redirect(chemin(`${PAGE}?fait=${id ? 'modifiee' : 'creee'}`))
}

/** Mettre en pause ou réactiver, supprimer. */
export async function agirSurAlerte(donnees: FormData): Promise<never> {
  const c = await compte()
  const id = String(donnees.get('alerte') ?? '')
  const geste = String(donnees.get('geste') ?? '')
  if (geste === 'supprimer') await db.execute(sql`DELETE FROM alertes_emploi WHERE id = ${id} AND user_id = ${c.id}::uuid`)
  if (geste === 'pause' || geste === 'reprendre') {
    // Reprendre repart d'aujourd'hui : pas de rattrapage des offres parues pendant la pause.
    await db.execute(sql`
      UPDATE alertes_emploi SET active = ${geste === 'reprendre'}, dernier_envoi_le = CASE WHEN ${geste === 'reprendre'} THEN now() ELSE dernier_envoi_le END
      WHERE id = ${id} AND user_id = ${c.id}::uuid
    `)
  }
  redirect(chemin(`${PAGE}?fait=${geste === 'supprimer' ? 'supprimee' : geste}`))
}
