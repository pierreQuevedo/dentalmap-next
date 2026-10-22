import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, ChevronRight, CircleDashed, Eye, GraduationCap, HeartPulse, ImagePlus, ListChecks, PanelsTopLeft, RefreshCw, Send, type LucideIcon } from 'lucide-react'
import { CoqueEspace, Statut, TitreTuile, Tuile } from '@/components/espace/coque'
import { CarteEtablissement } from '@/components/espace/etablissement'
import { TuileActivite, TuileSombre } from '@/components/espace/tuiles'
import { chemin } from '@/lib/navigation'
import { publierEtablissement } from '@/lib/espace-pro/actions-etablissement'
import { actives, portesOuvertesAJour, intituleDiplome } from '@/lib/espace-pro/etablissement'
import { aujourdhui, quand } from '../_commun'
import { Retour, chargerEtablissement, dateCourte, versEtab } from './_commun'

export const metadata: Metadata = { title: 'Espace établissement', robots: { index: false, follow: false } }
export const instant = false

const ICONE: Record<string, LucideIcon> = {
  acces: GraduationCap,
  alternance: GraduationCap,
  formations: GraduationCap,
  centres: HeartPulse,
  portes_ouvertes: CalendarDays,
  photo: ImagePlus,
}

/**
 * ETAB et FAC, vue d'ensemble : l'état de la page et la prochaine action,
 * l'aperçu de la carte de formation, les missions, les sections, la
 * fraîcheur et l'activité.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('vue', sp.fiche)
  const { source, fiche, force, missions, sections, gestion, coque, compte } = t
  const prenom = (compte.nom ?? '').trim().split(/\s+/)[0]
  const d = fiche.donnees
  const verifie = gestion.statut === 'acceptee'
  const enLigne = coque.enLigne
  const restantes = missions.filter((m) => !m.faite && m.gain > 0)
  const prochaine = restantes[0] ?? null
  const declarees = sections.filter((s) => s.statut !== 'auto' && !s.bientot)
  const publiees = declarees.filter((s) => s.statut === 'publiee').length
  const auto = sections.filter((s) => s.statut === 'auto').length
  const n = actives(d).length
  const fac = source.type === 'faculte'

  const texte = !verifie
    ? 'Votre attestation de fonction est en cours d’examen. Préparez la page en attendant : elle sera publiée dès la vérification.'
    : !enLigne
      ? 'Votre identité est vérifiée. Publiez vos formations pour que la page soit complétée par vos informations.'
      : prochaine
        ? `${publiees} section${publiees > 1 ? 's' : ''} déclarée${publiees > 1 ? 's' : ''} sur ${declarees.length} publiée${publiees > 1 ? 's' : ''}. ${prochaine.titre} rendrait la page plus complète pour les ${fac ? 'étudiants et les patients' : 'candidats'}.`
        : 'Tout est renseigné. Il reste l’entretien : annoncer les prochaines portes ouvertes, reconfirmer les formations chaque année.'

  const fraicheur = [
    { k: 'Portes ouvertes', v: d.aucunePorteOuverte ? 'Aucune cette année' : d.portesOuvertes ? (portesOuvertesAJour(d) ? `Le ${dateCourte(d.portesOuvertes)}` : 'Date passée') : 'À annoncer', alerte: !portesOuvertesAJour(d) },
    { k: fac ? 'Cursus' : 'Formations', v: d.confirmeLe.formations ? `Confirmées ${quand(d.confirmeLe.formations).toLowerCase()}` : 'À confirmer', alerte: force.items.find((i) => i.cle === 'formations')?.aReconfirmer ?? false },
    { k: 'Galerie', v: d.galerie.length ? `${d.galerie.length} photo${d.galerie.length > 1 ? 's' : ''}` : 'Aucune photo', alerte: !d.galerie.length },
    ...(fac ? [{ k: 'Centres de soins', v: d.centres.some((c) => !c.horaires || !c.jours.length) ? 'Horaires manquants' : d.centres.length ? 'À jour' : 'À renseigner', alerte: !d.centres.length || d.centres.some((c) => !c.horaires || !c.jours.length) }] : []),
  ]

  const activite = [
    fiche.publieeLe && { texte: 'Page publiée, visible dans l’annuaire de la formation', date: fiche.publieeLe },
    fiche.misAJourLe && { texte: 'Dernière modification enregistrée', date: fiche.misAJourLe },
    { texte: verifie ? (gestion.methode === 'domaine' ? 'Identité vérifiée par l’adresse de l’établissement' : 'Attestation de fonction acceptée') : 'Attestation de fonction déposée', date: gestion.demandeLe },
  ]
    .filter((a): a is { texte: string; date: string } => !!a)
    .map((a) => ({ texte: a.texte, quand: quand(a.date) }))

  return (
    <CoqueEspace c={coque} actif="vue" titre="Vue d’ensemble" sousTitre={`${aujourdhui()}${fiche.publieeLe ? ` · page publiée ${quand(fiche.publieeLe).toLowerCase().replace(/^(\d)/, 'le $1')}` : ''}`}>
      <div className="mb-4">
        <Retour erreur={sp.erreur} enregistre={sp.enregistre} bloc={sp.enregistre ?? ''} />
      </div>
      {verifie && !enLigne && (
        <form action={publierEtablissement} className="squircle-2xl mb-4 flex flex-wrap items-center gap-4 border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/30 dark:bg-amber-400/10">
          <input type="hidden" name="fiche" value={source.slug} />
          <p className="min-w-0 flex-1 text-sm text-fg">
            <span className="font-semibold">Vos formations ne sont pas encore publiées.</span> {n} formation{n > 1 ? 's' : ''} active{n > 1 ? 's' : ''}, prête{n > 1 ? 's' : ''}.
          </p>
          <button type="submit" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            <Send className="size-4" aria-hidden /> Publier
          </button>
        </form>
      )}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette={!verifie ? 'Vérification en cours' : enLigne ? 'Page en ligne' : 'Page en préparation'}
          titre={prenom ? `Bonjour ${prenom}` : 'Bonjour'}
          sousTitre={source.titre}
          texte={texte}
          pct={force.total}
          legende="page complète"
          chiffres={[
            [`${publiees} sur ${declarees.length}`, 'sections déclarées publiées'],
            [String(auto), 'sections automatiques à jour'],
            [d.aucunePorteOuverte ? 'Aucune' : portesOuvertesAJour(d) ? dateCourte(d.portesOuvertes) : '—', 'prochaines portes ouvertes'],
            [String(n), fac ? 'formation active' : `formation${n > 1 ? 's' : ''} active${n > 1 ? 's' : ''}`],
          ]}
          action={prochaine ? { meta: `+${prochaine.gain} % · ${prochaine.duree}`, titre: prochaine.titre, href: versEtab(t, prochaine.href), i: ICONE[prochaine.cle] ?? ListChecks } : null}
        />
        <Tuile>
          <TitreTuile i={Eye}>Aperçu public</TitreTuile>
          <ul className="mt-4">
            <CarteEtablissement
              titre={source.titre}
              type={source.type}
              extrait={intituleDiplome(d.accroche ?? source.extrait ?? '') || null}
              image={d.galerie[0] ?? source.image}
              lignes={actives(d).map((f) => ({ nom: intituleDiplome(f.intitule), duree: f.duree }))}
              ville={source.ville}
            />
          </ul>
          <p className="mt-3 text-center text-xs text-fg-2">
            {d.portesOuvertes && portesOuvertesAJour(d) ? `Portes ouvertes le ${dateCourte(d.portesOuvertes)}. ` : ''}Mis à jour à chaque enregistrement.
          </p>
        </Tuile>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Tuile>
          <TitreTuile i={ListChecks} droite={<span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">{missions.filter((m) => m.faite).length} sur {missions.length}</span>}>
            Missions
          </TitreTuile>
          {restantes.length === 0 ? (
            <p className="mt-4 text-sm text-fg-2">Tout est fait. Il reste l’entretien.</p>
          ) : (
            <ul className="mt-4 space-y-1">
              {restantes.map((m, i) => (
                <li key={m.cle}>
                  <Link href={chemin(versEtab(t, m.href))} className={`squircle-xl flex items-center gap-3 p-3 hover:bg-bg-soft ${i === 0 ? 'bg-amber-50 ring-1 ring-amber-200 hover:bg-amber-50 dark:bg-amber-400/10 dark:ring-amber-400/30' : ''}`}>
                    <CircleDashed className="size-5 text-fg-2" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{m.titre}</span>
                      <span className={`block text-xs ${i === 0 ? 'text-amber-700 dark:text-amber-300' : 'text-fg-2'}`}>
                        {i === 0 ? 'Recommandée · ' : ''}
                        {m.duree}
                      </span>
                    </span>
                    <span className="squircle-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">+{m.gain} %</span>
                    <ChevronRight className="size-4 text-fg-2" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tuile>
        <Tuile>
          <TitreTuile i={PanelsTopLeft} droite={<Link href={chemin(versEtab(t, 'ma-page'))} className="text-xs text-fg-2 hover:text-fg">{sections.length} sections</Link>}>
            Sections de la page
          </TitreTuile>
          <ul className="mt-4 space-y-2.5">
            {sections.slice(0, 8).map((s) => (
              <li key={s.cle} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-fg">{s.titre}</span>
                {s.bientot ? <span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2 ring-1 ring-inset ring-line">Bientôt</span> : <Statut s={s.statut} libelle={s.cle === 'formations' && s.statut === 'incomplete' ? s.manque : undefined} />}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-2">Une section vide n’apparaît pas sur la page publique.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={RefreshCw}>Fraîcheur des informations</TitreTuile>
          <ul className="mt-4 space-y-4 text-sm">
            {fraicheur.map((f) => (
              <li key={f.k}>
                <div className="flex justify-between gap-3">
                  <span className="text-fg">{f.k}</span>
                  <span className={f.alerte ? 'text-amber-700 dark:text-amber-300' : 'text-fg-2'}>{f.v}</span>
                </div>
                <span className="mt-2 block h-1 rounded-full bg-line">
                  <span className={`block h-full rounded-full ${f.alerte ? 'w-full bg-amber-400' : 'w-[12%] bg-teal'}`} />
                </span>
              </li>
            ))}
          </ul>
        </Tuile>
      </div>

      <div className="mt-4">
        <TuileActivite items={activite} />
      </div>
    </CoqueEspace>
  )
}
