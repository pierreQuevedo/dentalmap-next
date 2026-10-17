import type { Metadata } from 'next'
import { CalendarCheck, Clock, FileCheck2, FileText, ImagePlus, Images, Link2, Send, Sparkles, Stethoscope, Users, Wrench, type LucideIcon } from 'lucide-react'
import { CoqueEspace } from '@/components/espace/coque'
import { ApercuPublic, Celebration, TuileActivite, TuileFiltres, TuileFraicheur, TuileMissions, TuileSombre } from '@/components/espace/tuiles'
import { getChiffresCles } from '@/lib/annuaire/queries'
import { aujourdhui, chargerTableau, quand } from './_commun'

export const metadata: Metadata = { title: 'Espace pro', robots: { index: false, follow: false } }
export const instant = false

const ICONE_MISSION: Record<string, LucideIcon> = {
  horaires: CalendarCheck,
  conventionnement: FileText,
  accueil: Users,
  photo: ImagePlus,
  presentation: FileText,
  soins: Stethoscope,
  liens: Link2,
  savoir_faire: Wrench,
  delais: Clock,
  realisations: Images,
  ansm: FileCheck2,
}

/**
 * Vue d'ensemble (DASH-1, DASH-2, DASH-3) : l'état de la fiche et la prochaine
 * action, l'aperçu public, les missions, les filtres ouverts, la fraîcheur et
 * l'activité. `?publiee=1` après la publication, `?bravo=1` après une mission
 * qui fait passer le palier Exemplaire : la célébration (J) se pose dessus.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; publiee?: string; bravo?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('vue', sp.fiche)
  const { fiche, completee, force, palier, missions, prochaine, filtres, fraicheur } = espace
  const chiffres = await getChiffresCles()
  const nom = coque.nom
  const exemplaire = palier === 'exemplaire'
  const enAttente = fiche.demande?.statut === 'en_attente'
  const faites = missions.filter((m) => m.faite).length
  const apres = prochaine ? Math.min(100, force.total + prochaine.gain) : force.total

  const delais = Object.values(completee?.delais ?? {})
  const titre = espace.labo && !exemplaire ? `Bonjour, ${nom}` : sp.publiee ? `Bonjour ${nom}` : exemplaire ? (prochaine ? `Plus qu’une mission, ${nom}` : `Tout est en place, ${nom}`) : `Bon retour ${nom}`
  const texte = enAttente
    ? 'Votre fiche est prête. Elle sera publiée dès que la vérification de votre identité aboutit ; vous pouvez la compléter en attendant.'
    : !prochaine
      ? 'Il n’y a plus rien à compléter. Le travail devient l’entretien : reconfirmer quand on vous le demande, et faire connaître la fiche.'
      : prochaine.gain
        ? `${sp.publiee ? 'Votre fiche est publiée. ' : ''}${prochaine.titre} la ferait passer de ${force.total} à ${apres} %.`
        : `${prochaine.titre} : ${prochaine.detail.toLowerCase()}.`

  const activite = [
    completee?.publieeLe && { texte: `Fiche publiée, visible par les ${espace.labo ? 'cabinets' : 'patients'}`, date: completee.publieeLe },
    completee?.photoConfirmeeLe && completee.photoUrl && { texte: 'Photo du cabinet publiée', date: completee.photoConfirmeeLe },
    completee?.presentationConfirmeeLe && completee.presentation && { texte: 'Présentation enregistrée', date: completee.presentationConfirmeeLe },
    fiche.demande?.statut === 'acceptee' &&
      fiche.demande.traiteLe && {
        texte: fiche.demande.methode === 'pro_sante_connect' ? 'Identité confirmée par Pro Santé Connect' : 'Identité vérifiée par l’équipe',
        date: fiche.demande.traiteLe,
      },
    completee?.delaisConfirmesLe && { texte: 'Délais de fabrication confirmés', date: completee.delaisConfirmesLe },
    completee?.realisationsConfirmeesLe && completee.realisations.length > 0 && { texte: 'Réalisations publiées', date: completee.realisationsConfirmeesLe },
    chiffres.synchroniseLe && { texte: espace.labo ? 'Base Sirene synchronisée' : 'Synchronisation Annuaire Santé', date: chiffres.synchroniseLe },
  ]
    .filter((a): a is { texte: string; date: string } => !!a)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5)
    .map((a) => ({ texte: a.texte, quand: quand(a.date) }))

  return (
    <CoqueEspace c={coque} actif="vue" titre="Vue d’ensemble" sousTitre={`${aujourdhui()}${completee?.publieeLe ? ` · fiche publiée ${quand(completee.publieeLe).toLowerCase()}` : ''}`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette={enAttente ? 'Vérification en cours' : exemplaire ? 'Fiche exemplaire' : 'Fiche en ligne'}
          titre={titre}
          texte={texte}
          pct={force.total}
          legende={prochaine?.gain ? `→ ${apres} % possible` : 'force de fiche'}
          chiffres={[
            [`${filtres.filter((f) => f.actif).length} sur ${filtres.length}`, espace.labo ? 'filtres cabinets actifs' : 'filtres patients actifs'],
            [`${faites} sur ${missions.length}`, 'missions faites'],
            espace.labo
              ? [delais.length ? `${Math.min(...delais)} à ${Math.max(...delais)} j` : '—', 'délais moyens publiés']
              : [chiffres.synchroniseLe ? new Date(chiffres.synchroniseLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—', 'dernière vérification du registre'],
            [String(fiche.lieux.length), fiche.lieux.length > 1 ? 'lieux d’exercice' : 'lieu d’exercice'],
          ]}
          action={
            prochaine
              ? { meta: `${prochaine.gain ? `+${prochaine.gain} % · ` : ''}${prochaine.minutes} min`, titre: prochaine.titre === 'Photo du cabinet' ? 'Ajouter la photo du cabinet' : prochaine.titre, href: `${prochaine.href}${q}`, i: ICONE_MISSION[prochaine.cle] ?? Sparkles }
              : { meta: 'Visibilité · 2 min', titre: 'Mettre votre lien dans la fiche Google', href: `/espace-pro/partager/${q}`, i: Send }
          }
        />
        <ApercuPublic praticien={{ ...fiche.resume, revendiquee: !enAttente }} profession={fiche.profession} photo={completee?.photoUrl} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <TuileMissions missions={missions} q={q} />
        <TuileFiltres filtres={filtres} public={espace.labo ? 'cabinets' : 'patients'} />
        <TuileFraicheur fraicheur={fraicheur} href={`/espace-pro/fraicheur/${q}`} note="Reconfirmer prend un clic, sans ressaisie." />
      </div>
      {activite.length > 0 && (
        <div className="mt-4">
          <TuileActivite items={activite} />
        </div>
      )}
      {(sp.bravo || sp.publiee) && exemplaire && <Celebration pct={force.total} partager={`/espace-pro/partager/${q}`} fermer={`/espace-pro/${q}`} labo={espace.labo} />}
    </CoqueEspace>
  )
}
