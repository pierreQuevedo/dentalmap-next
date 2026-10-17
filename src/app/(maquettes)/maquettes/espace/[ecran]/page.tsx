/**
 * MAQUETTE, à supprimer une fois l'espace pro codé : écrans du tableau de bord
 * par profil, capturés vers Figma. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EtabFormations, EtabGalerie, EtabPage, EtabVue } from '../_etablissement'
import { LaboDelais, LaboRealisations, LaboSavoir, LaboVue, LaboZone } from '../_labo'
import { FacAcces, FacCursus, FacSoins, FacVue } from '../_faculte'
import { Celebration, DashExemplaire, DashRetour, Distinctions, Equipe, LaboMission, MisPhoto, MisPresentation } from '../_etats'
import { CompteCommun, Notifications, Partager, RegistreCommun, Statistiques } from '../_partages'
import { EcranGalerie } from '../_commun'
import { OUVERTS } from '../_ouverts'
import { TRANSVERSES } from '../_transverses'
import { EtabAdmission, Evenements, FacPage, LaboFiche } from '../_bloc2'
import { CandidaturesDentiste, CandidaturesLabo, EmploiDentiste, EmploiLabo } from '../_emploi'
import { EtuCandidatures, EtuFormation, EtuOffre, EtuOffres, EtuProfil, EtuVue, SalAlertes, SalCandidatures, SalOffre, SalOffres, SalProfil, SalVisibilite, SalVue } from '../_candidat'
import { DentCompte, DentFiche, DentFraicheur, DentMissions, DentPartager, DentRegistre, DentVue } from '../_dentiste'

export const metadata: Metadata = { title: 'Maquette espace pro', robots: { index: false, follow: false } }

const ECRANS = {
  'etablissement-vue': EtabVue,
  'etablissement-page': EtabPage,
  'etablissement-galerie': EtabGalerie,
  'etablissement-formations': EtabFormations,
  'labo-vue': LaboVue,
  'labo-delais': LaboDelais,
  'labo-savoir': LaboSavoir,
  'labo-zone': LaboZone,
  'labo-realisations': LaboRealisations,
  'faculte-vue': FacVue,
  'faculte-acces': FacAcces,
  'faculte-soins': FacSoins,
  'faculte-cursus': FacCursus,
  'dentiste-vue': DentVue,
  'dentiste-fiche': DentFiche,
  'dentiste-missions': DentMissions,
  'dentiste-fraicheur': DentFraicheur,
  'dentiste-registre': DentRegistre,
  'dentiste-partager': DentPartager,
  'dentiste-compte': DentCompte,
  'dentiste-mis-photo': MisPhoto,
  'dentiste-mis-presentation': MisPresentation,
  'dentiste-retour': DashRetour,
  'dentiste-celebration': Celebration,
  'dentiste-exemplaire': () => <DashExemplaire />,
  'dentiste-distinctions': Distinctions,
  'labo-mission': LaboMission,
  'labo-equipe': () => <Equipe />,
  'dentiste-notifications': () => <Notifications profil="dentiste" />,
  'dentiste-stats': () => <Statistiques profil="dentiste" />,
  'labo-notifications': () => <Notifications profil="labo" />,
  'labo-stats': () => <Statistiques profil="labo" />,
  'labo-partager-c': () => <Partager profil="labo" />,
  'labo-registre-c': () => <RegistreCommun profil="labo" />,
  'labo-compte-c': () => <CompteCommun profil="labo" />,
  'etablissement-notifications': () => <Notifications profil="etablissement" />,
  'etablissement-stats': () => <Statistiques profil="etablissement" />,
  'etablissement-partager-c': () => <Partager profil="etablissement" />,
  'etablissement-registre-c': () => <RegistreCommun profil="etablissement" />,
  'etablissement-compte-c': () => <CompteCommun profil="etablissement" />,
  'faculte-notifications': () => <Notifications profil="faculte" />,
  'faculte-stats': () => <Statistiques profil="faculte" />,
  'faculte-partager-c': () => <Partager profil="faculte" />,
  'faculte-registre-c': () => <RegistreCommun profil="faculte" />,
  'faculte-compte-c': () => <CompteCommun profil="faculte" />,
  'etablissement-equipe': () => <Equipe profil="etablissement" />,
  'faculte-equipe': () => <Equipe profil="faculte" />,
  'faculte-galerie': () => (
    <EcranGalerie
      profil="faculte"
      actif="galerie"
      titre="Galerie"
      sousTitre="18 photos sur 24 · les 5 premières s’affichent sur la page"
      photos={[
        { src: '/images/demo/pexels-6627471.jpg', legende: 'Centre de soins du centre-ville' },
        { src: '/images/demo/pexels-6627320.jpg', legende: 'Travaux pratiques sur simulateur' },
        { src: '/images/demo/pexels-6627447.jpg', legende: 'Consultation encadrée' },
        { src: '/images/demo/pexels-8413334.jpg', legende: 'Plateau de radiologie' },
        { src: '/images/demo/pexels-7800669.jpg', legende: '' },
      ]}
      credit="Service communication, Université de l’Estuaire"
      sujet="page"
      droits="La faculté détient les droits de ces photos, et les patients et étudiants reconnaissables ont donné leur accord."
    />
  ),
  'labo-fiche': LaboFiche,
  'etablissement-admission': EtabAdmission,
  'etablissement-evenements': () => <Evenements profil="etablissement" />,
  'faculte-page': FacPage,
  'faculte-evenements': () => <Evenements profil="faculte" />,
  'dentiste-emploi': EmploiDentiste,
  'labo-emploi': EmploiLabo,
  'dentiste-candidatures': CandidaturesDentiste,
  'labo-candidatures': CandidaturesLabo,
  'salarie-vue': SalVue,
  'etudiant-vue': EtuVue,
  'salarie-offres': SalOffres,
  'etudiant-offres': EtuOffres,
  'salarie-offre': SalOffre,
  'etudiant-offre': EtuOffre,
  'salarie-candidatures': SalCandidatures,
  'etudiant-candidatures': EtuCandidatures,
  'salarie-profil': SalProfil,
  'etudiant-profil': EtuProfil,
  'salarie-alertes': SalAlertes,
  'salarie-visibilite': SalVisibilite,
  'etudiant-formation': EtuFormation,
  ...TRANSVERSES,
  ...Object.fromEntries(Object.entries(OUVERTS).map(([k, v]) => ['o-' + k, v])),
} as Record<string, () => React.JSX.Element>

export function generateStaticParams() {
  return Object.keys(ECRANS).map((ecran) => ({ ecran }))
}

export default async function Page(props: { params: Promise<{ ecran: string }> }) {
  const { ecran } = await props.params
  const E = ECRANS[ecran as keyof typeof ECRANS]
  if (!E) notFound()
  return <E />
}
