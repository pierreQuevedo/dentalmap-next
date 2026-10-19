/**
 * Les sources des liens de partage : chaque lien que l'espace pro donne porte
 * son code dans l'adresse, `/p/<slug>/<code>/`, pour des statistiques par
 * canal. Le lien court nu, `/p/<slug>/`, compte en « Lien direct ».
 * Module pur : importé par les routes, les pages et les tests.
 */
export const SOURCES = [
  { cle: 'google', code: 'g', libelle: 'Fiche Google', detail: 'Le lien dans votre fiche d’établissement Google' },
  { cle: 'story', code: 'st', libelle: 'Story', detail: 'Le sticker lien de vos stories' },
  { cle: 'qr', code: 'q', libelle: 'Code QR', detail: 'Le code QR des visuels, scanné' },
  { cle: 'reseaux', code: 'r', libelle: 'Publications', detail: 'Le lien du texte à publier' },
  { cle: 'badge', code: 'b', libelle: 'Site du cabinet', detail: 'Le badge « Vérifié sur DentalMap »' },
  { cle: 'direct', code: '', libelle: 'Lien direct', detail: 'Le lien court, partagé ailleurs' },
] as const

export type CleSource = (typeof SOURCES)[number]['cle']

/** La source d'un code d'adresse ; un code inconnu compte en lien direct. */
export function sourceDuCode(code: string | null | undefined): CleSource {
  return SOURCES.find((s) => s.code && s.code === code)?.cle ?? 'direct'
}

/** Le lien de partage d'une fiche pour une source. */
export function lienDeSource(site: string, slug: string, cle: CleSource): string {
  const code = SOURCES.find((s) => s.cle === cle)?.code
  return `${site.replace(/\/$/, '')}/p/${slug}/${code ? `${code}/` : ''}`
}

/**
 * Robots, moteurs et aperçus de liens (messageries, réseaux) : ils ouvrent le
 * lien sans être un visiteur. L'aperçu d'Instagram, de WhatsApp ou de Slack
 * passerait sinon pour une visite à chaque partage.
 */
export function estRobot(agent: string | null): boolean {
  if (!agent) return true
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|slack|discord|linkedin|skype|embedly|curl|wget|python|headless|lighthouse/i.test(agent)
}
