import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { CalendarCheck, ExternalLink, Globe, Info } from 'lucide-react'
import { Encart, pastille, saisie } from '@/components/compte/ui'
import { ECHECS_MASQUE } from '@/lib/espace-pro/fiche-completee'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { PanneauMission } from '@/components/espace/mission'
import { enregistrerLiens } from '@/lib/espace-pro/actions-fiche'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Liens du cabinet', robots: { index: false, follow: false } }
export const instant = false

/** MIS-L : le site du cabinet et la prise de rendez-vous en ligne. Hors barème : un service, pas des points. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('missions', sp.fiche, 'liens')
  const gardee = await lireSaisie('/espace-pro/missions/liens/', sp.erreur)
  const c = espace.completee
  // Le test hebdomadaire : un lien en échec est signalé dès la première fois, masqué à la deuxième.
  const enEchec = (['site', 'rdv'] as const).filter((k) => (c?.liensEchecs[k] ?? 0) > 0 && (k === 'site' ? c?.siteWeb : c?.rdvEnLigne))
  const libelleLien = { site: 'Le site du cabinet', rdv: 'La prise de rendez-vous en ligne' }
  return (
    <CoqueEspace c={coque} actif="progression" titre="Progression" sousTitre="Liens du cabinet · hors barème · 1 min">
      <PanneauMission
        cle="liens"
        titre="Liens du cabinet"
        meta="Mission · hors barème · 1 min"
        intro="Deux boutons sur votre fiche. Le lien mène directement chez vous, sans intermédiaire ni suivi."
        action={enregistrerLiens}
        fiche={espace.fiche.slug}
        avant={espace.force.total}
        q={q}
        erreur={sp.erreur}
        cote={
          <Tuile>
            <TitreTuile i={Info}>Sur la fiche</TitreTuile>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex h-9 items-center gap-2 rounded-full bg-action px-4 text-xs font-semibold text-action-foreground">Appeler le cabinet</span>
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-4 text-xs font-medium text-fg">
                <Globe className="size-3.5" aria-hidden /> Site du cabinet <ExternalLink className="size-3" aria-hidden />
              </span>
            </div>
            <p className="mt-3 text-xs text-fg-2">Laissez un champ vide pour ne pas afficher son bouton.</p>
          </Tuile>
        }
      >
        <div className="space-y-5">
          {enEchec.map((k) => (
            <Encart key={k} ton="erreur" titre={`${libelleLien[k]} ne répond pas`}>
              {(c?.liensEchecs[k] ?? 0) >= ECHECS_MASQUE
                ? 'Deux semaines de suite sans réponse : le bouton est masqué sur votre fiche. Corrigez l’adresse et enregistrez, il réapparaît aussitôt.'
                : 'Le dernier test hebdomadaire n’a pas abouti. Vérifiez l’adresse : sans réponse la semaine prochaine, le bouton sera masqué.'}
            </Encart>
          ))}
          <div>
            <label htmlFor="lien-site" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
              <Globe className="size-4 text-fg-2" aria-hidden /> Site du cabinet
            </label>
            <div className={pastille}>
              <input id="lien-site" name="site" type="url" inputMode="url" defaultValue={gardee.texte('site') ?? c?.siteWeb ?? ''} placeholder="https://cabinet-exemple.fr" className={saisie} />
            </div>
          </div>
          <div>
            <label htmlFor="lien-rdv" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
              <CalendarCheck className="size-4 text-fg-2" aria-hidden /> Prise de rendez-vous en ligne
            </label>
            <div className={pastille}>
              <input id="lien-rdv" name="rdv" type="url" inputMode="url" defaultValue={gardee.texte('rdv') ?? c?.rdvEnLigne ?? ''} placeholder="Collez l’adresse de votre page de rendez-vous" className={saisie} />
            </div>
            <p className="mt-1.5 text-xs text-fg-2">Laissez vide si vous ne prenez pas de rendez-vous en ligne : la fiche n’affichera que le téléphone.</p>
          </div>
        </div>
      </PanneauMission>
    </CoqueEspace>
  )
}
