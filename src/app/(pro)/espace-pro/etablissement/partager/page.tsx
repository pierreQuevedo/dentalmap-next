import type { Metadata } from 'next'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Check, Download, ExternalLink, Image as Visuel, Link2, Mail, MessageSquareQuote, QrCode, Star } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { Copier } from '@/components/espace/copier'
import { EnTeteEtab } from '@/components/espace/en-tete-etablissement'
import { ReponseAvis } from '@/components/espace/avis-espace'
import { VisuelsAvis } from '@/components/espace/visuels-avis'
import { SignalerAvis } from '@/components/formation/avis-client'
import { Etoiles } from '@/components/formation/etoiles'
import { chemin } from '@/lib/navigation'
import { SITE_URL } from '@/lib/seo/site'
import { POINTS_AVIS, libelleLien, noteFr, recherchePour, resumerAvis } from '@/lib/formation/avis'
import { getAvisGeres } from '@/lib/formation/avis-donnees'
import { dateLisible } from '@/lib/formation/page-etablissement'
import { chargerEtablissement } from '../_commun'

export const metadata: Metadata = { title: 'Partage et avis', robots: { index: false, follow: false } }
export const instant = false

const FAIT: Record<string, string> = {
  reponse: 'Réponse publiée sous l’avis.',
  'reponse-retiree': 'Réponse retirée.',
  signale: 'Signalement envoyé : l’équipe l’examine, l’avis reste affiché d’ici sa décision.',
}

/**
 * Partage et avis : ce qui fait le plus remonter la page. Le lien et le code
 * QR qui mènent droit au formulaire d'avis, un message prêt à envoyer aux
 * étudiants et aux anciens, puis les avis reçus, avec la réponse publique
 * de l'établissement et le signalement à l'équipe.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; fait?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('partager', sp.fiche)
  const { source, coque } = t
  const avis = await getAvisGeres(source.slug)
  const publies = avis.filter((a) => a.statut === 'publie')
  const resume = resumerAvis(publies.map((a) => a.note))
  const sansReponse = publies.filter((a) => !a.reponse).length
  const fac = source.type === 'faculte'
  const lienAvis = `${SITE_URL}${source.lien}avis/`
  // Le code QR se fabrique ici : en SVG pour la page et le téléchargement, en PNG pour les visuels.
  const couleurs = { dark: '#0e1317', light: '#ffffff' }
  const [qrSvg, qrPng] = await Promise.all([QRCode.toString(lienAvis, { type: 'svg', margin: 1, color: couleurs }), QRCode.toDataURL(lienAvis, { margin: 1, width: 720, color: couleurs })])
  const photo = t.fiche.donnees.galerie[0]?.url ?? null
  const message = `Bonjour,\n\nVous avez étudié ${fac ? 'à la faculté' : 'à l’école'} : donnez votre avis en deux minutes, ici :\n${lienAvis}\n\nIl aide les futurs étudiants à choisir, et vous rapporte +${POINTS_AVIS} points de mise en avant pour votre recherche de ${recherchePour(source.type)} sur DentalMap, quelle que soit votre note.\n\nMerci pour votre retour, qu’il soit positif ou non.\n\n${source.titre}`

  return (
    <CoqueEspace c={coque} actif="partager" titre="Partage et avis" sousTitre="Faire connaître la page, recueillir les avis et y répondre">
      {sp.fait && FAIT[sp.fait] && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> {FAIT[sp.fait]}
        </p>
      )}
      <EnTeteEtab
        i={Star}
        etiquette="Avis"
        titre={resume.nombre ? `${resume.nombre} avis, note de ${noteFr(resume.moyenne!)} sur 5` : 'Recueillez vos premiers avis'}
        texte="Les avis font remonter votre page dans la recherche des formations : c’est ce qui compte le plus, avant le remplissage de la page. Partagez le lien avec vos étudiants, vos anciens et leurs familles, et répondez à chaque avis."
        pct={publies.length ? Math.round(((publies.length - sansReponse) / publies.length) * 100) : 0}
        legende="avis répondus"
        gain={null}
        puces={[
          { fait: resume.nombre > 0, libelle: resume.nombre ? `${resume.nombre} avis publiés` : 'Premier avis' },
          { fait: resume.nombre >= 10, libelle: '10 avis' },
          { fait: publies.length > 0 && sansReponse === 0, libelle: sansReponse ? `${sansReponse} sans réponse` : 'Tous répondus' },
        ]}
        progression={coque.progressionEtab!}
        q={t.q}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Tuile id="partager" className="scroll-mt-24">
          <TitreTuile i={Link2}>Le lien vers le formulaire d’avis</TitreTuile>
          <p className="mt-1 text-sm text-fg-2">Il ouvre directement le formulaire ; la personne se connecte ou crée un compte en une minute.</p>
          <div className="mt-4">
            <Copier texte={lienAvis} affiche={lienAvis.replace(/^https?:\/\//, '')} />
          </div>
          <div className="mt-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Mail className="size-4 text-fg-2" aria-hidden /> Un message prêt à envoyer
            </p>
            <p className="mt-1 text-xs text-fg-2">Par email à vos promotions, dans l’espace numérique de travail, ou dans le groupe des anciens.</p>
            <pre className="squircle-xl mt-3 whitespace-pre-wrap border border-line bg-bg-soft p-4 font-sans text-sm leading-relaxed text-fg">{message}</pre>
            <div className="mt-2 max-w-xs">
              <Copier texte={message} affiche="Copier le message" mono={false} />
            </div>
          </div>
          <p className="mt-6 text-xs text-fg-2">
            Demandez un avis à tous, sans le réserver aux plus satisfaits. DentalMap donne les mêmes points à chaque auteur, quelle que soit la note : ne promettez rien d’autre en échange d’un avis.
          </p>
        </Tuile>
        <Tuile>
          <TitreTuile i={QrCode}>Code QR</TitreTuile>
          <p className="mt-1 text-sm text-fg-2">À afficher en salle, dans les ateliers{fac ? ', au centre de soins' : ''} ou sur une plaquette.</p>
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="squircle-xl size-40 bg-white p-2 ring-1 ring-line [&_svg]:size-full" role="img" aria-label={`Code QR vers le formulaire d’avis de ${source.titre}`} dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`} download="avis-dentalmap-qr.svg" className="inline-flex items-center gap-1.5 text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
              <Download className="size-4" aria-hidden /> Télécharger le code QR
            </a>
            <p className="text-center text-xs text-fg-2">En SVG : il reste net à toutes les tailles, de la plaquette au kakémono.</p>
          </div>
        </Tuile>
      </div>

      <Tuile id="visuels" className="mt-4 scroll-mt-24">
        <TitreTuile i={Visuel}>Visuels à imprimer et à partager</TitreTuile>
        <p className="mt-1 text-sm text-fg-2">Aux couleurs de DentalMap, avec votre photo et le code QR du formulaire : chaque avis rapporte des points de mise en avant à son auteur.</p>
        <div className="mt-5">
          <VisuelsAvis
            nom={source.titre}
            faculte={fac}
            qr={qrPng}
            adresse={new URL(SITE_URL).host.replace(/^www\./, '')}
            photo={photo}
            points={POINTS_AVIS}
            recherche={recherchePour(source.type)}
          />
        </div>
      </Tuile>

      <Tuile id="avis" className="mt-4 scroll-mt-24">
        <TitreTuile
          i={MessageSquareQuote}
          droite={
            <Link href={chemin(`${source.lien}#avis`)} className="inline-flex items-center gap-1 text-xs font-medium text-fg hover:underline">
              Voir sur la page <ExternalLink className="size-3" aria-hidden />
            </Link>
          }
        >
          Avis reçus
        </TitreTuile>
        {avis.length === 0 ? (
          <p className="mt-3 text-sm text-fg-2">Aucun avis pour l’instant. Les premiers arrivent en général dans les jours qui suivent l’envoi du lien.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {avis.map((a) => (
              <li key={a.id} className={`squircle-xl border p-4 ${a.statut === 'retire' ? 'border-dashed border-line bg-bg-soft opacity-70' : !a.reponse ? 'border-amber-200 dark:border-amber-400/30' : 'border-line'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-3">
                    <Etoiles note={a.note} />
                    <span className="text-sm text-fg-2">
                      <span className="font-medium text-fg">{a.auteur}</span> · {libelleLien(a.lien)}
                      {a.annee ? `, ${a.annee}` : ''}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-fg-2">
                    {a.statut === 'retire' ? <span className="squircle-full bg-bg px-2 py-0.5 ring-1 ring-line">Retiré par l’équipe</span> : a.signale ? <span className="squircle-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">Signalé, en examen</span> : !a.reponse ? <span className="squircle-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">Sans réponse</span> : null}
                    {dateLisible(a.creeLe)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg">{a.texte}</p>
                {a.statut === 'publie' && (
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <ReponseAvis avis={a.id} reponse={a.reponse} nom={source.titre} />
                    </div>
                    {!a.signale && <SignalerAvis avis={a.id} />}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </Tuile>
    </CoqueEspace>
  )
}
