import type { Objet } from '@/lib/contact/objets'

/**
 * Dépose un message de la page contact dans l'espace SAV du back-office
 * (plugin WordPress `dentalmap-sav`, POST /wp-json/dentalmap/v1/sav/tickets).
 *
 * L'appel est authentifié par la clé partagée `DM_API_KEY`, la même que la
 * constante du wp-config de cms.dentalmap.fr. Sans clé, rien ne part : le
 * courriel à l'équipe reste alors le seul canal.
 */
export async function deposerTicketSav(d: {
  prenom: string
  nom: string
  email: string
  telephone?: string
  objet: Objet
  fiche?: string
  message: string
}): Promise<'coupe' | { numero: number }> {
  const cle = process.env.DM_API_KEY
  const graphql = process.env.WP_GRAPHQL_URL
  if (!cle || !graphql) return 'coupe'

  const complements = [d.telephone && `Téléphone : ${d.telephone}`, d.fiche && `Fiche concernée : ${d.fiche}`].filter(Boolean)
  const r = await fetch(`${new URL(graphql).origin}/wp-json/dentalmap/v1/sav/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-dentalmap-admin': cle },
    body: JSON.stringify({
      objet: d.objet,
      nom: [d.prenom, d.nom].map((s) => s.trim()).filter(Boolean).join(' '),
      email: d.email,
      message: complements.length ? `${d.message}\n\n${complements.join('\n')}` : d.message,
      detail: d.telephone ? `Tél. ${d.telephone}` : undefined,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`SAV ${r.status} ${await r.text().catch(() => '')}`)
  const { numero } = (await r.json()) as { numero: number }
  return { numero }
}
