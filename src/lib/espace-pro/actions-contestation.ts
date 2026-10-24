'use server'

import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { envoyerAModerer } from '@/lib/email'
import { exigerConnexion } from '@/lib/tunnel/compte'
import { contestationPourTitulaire } from './contestation'

/** Le titulaire répond : il gère toujours la fiche, ou il la cède. L'équipe est prévenue et tranche. */
export async function repondreContestation(donnees: FormData): Promise<never> {
  const id = String(donnees.get('id') ?? '')
  const compte = await exigerConnexion(`/espace-pro/contestation/${id}/`)
  const c = await contestationPourTitulaire(id, compte.id)
  if (!c || c.statut !== 'en_attente') redirect(chemin('/espace-pro/'))
  const reponse = donnees.get('reponse') === 'cede' ? 'cede' : 'maintient'
  await db.execute(sql`UPDATE revendications SET titulaire_reponse = ${reponse}, titulaire_repondu_le = now() WHERE id = ${id}`)
  await envoyerAModerer(
    `réponse du titulaire pour ${c.fiche}`,
    reponse === 'cede' ? `Le titulaire de « ${c.fiche} » (${compte.email}) cède la fiche à l’autre demande.` : `Le titulaire de « ${c.fiche} » (${compte.email}) indique qu’il gère toujours la fiche.`,
  )
  redirect(chemin(`/espace-pro/contestation/${id}/?fait=${reponse}`))
}
