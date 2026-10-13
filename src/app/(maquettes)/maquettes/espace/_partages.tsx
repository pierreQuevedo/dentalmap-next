/** MAQUETTE. Écrans communs aux quatre profils : notifications, statistiques, partage, registre, compte. */
import {
  Bell,
  Copy,
  Globe,
  KeyRound,
  Link2,
  Lock,
  Mail,
  MousePointerClick,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import { Coque, Tuile, TitreTuile, type ProfilPro as Profil } from './_coque'

type Notif = { t: string; d: string; quand: string; type: 'action' | 'registre' | 'fraicheur' | 'info'; lu?: boolean }

/* Données propres à chaque profil. */
const P = {
  dentiste: {
    sujet: 'fiche', lien: 'dentalmap.fr/p/dupont-bdx', site: 'cabinet-sainte-catherine.fr',
    notifs: [
      { t: 'Vos horaires sont à reconfirmer dans 15 jours', d: 'Un clic suffit s’ils n’ont pas changé.', quand: 'Aujourd’hui', type: 'fraicheur' },
      { t: 'Lien de prise de rendez-vous injoignable', d: 'Il est masqué de la fiche jusqu’à correction.', quand: 'Hier', type: 'action' },
      { t: 'Annuaire Santé synchronisé, aucun changement', d: 'Identité, RPPS et lieux d’exercice inchangés.', quand: '6 oct.', type: 'registre', lu: true },
      { t: 'Distinction obtenue : Horaires complets', d: 'Privée, visible dans votre espace seulement.', quand: '5 oct.', type: 'info', lu: true },
    ] as Notif[],
    visites: [12, 18, 14, 22, 19, 25, 31, 28, 24, 30, 35, 33, 29, 41, 38, 36, 44, 40, 47, 43, 39, 52, 48, 45, 50, 57, 53, 49, 58, 61],
    total: '1 184', evolution: '+32 %',
    actions: [['Appels au cabinet', '146'], ['Itinéraires', '212'], ['Prises de rendez-vous', '88'], ['Site du cabinet', '54']],
    filtres: [['Ouvert maintenant', 38], ['Secteur 1', 27], ['Tiers payant', 19], ['Enfants', 9], ['Anglais', 7]],
    sources: [['Recherche DentalMap', 54], ['Google', 31], ['Lien court et badge', 15]],
    parrain: 'Parrainer un confrère', parrainChamp: 'Nom ou numéro RPPS',
    registreTitre: 'Annuaire Santé', registre: [] as [string, string][],
    connexion: [['Code à 6 chiffres par courriel', 'Activé', true], ['Pro Santé Connect', 'Lié le 8 octobre 2026', true]] as [string, string, boolean][],
    email: 'm.dupont@cabinet-sainte-catherine.fr',
  },
  labo: {
    sujet: 'fiche', lien: 'dentalmap.fr/p/artemis-merignac', site: 'artemis-dentaire.fr',
    notifs: [
      { t: 'Délais de fabrication à reconfirmer avant le 12 mars', d: 'Au-delà de douze mois, ils ne sont plus affichés.', quand: 'Aujourd’hui', type: 'fraicheur' },
      { t: 'Déclaration ANSM en cours de vérification', d: 'Réponse sous 48 heures ouvrées.', quand: 'Hier', type: 'action' },
      { t: 'Base Sirene synchronisée, établissement ouvert', d: 'SIRET et activité 32.50A inchangés.', quand: '28 sept.', type: 'registre', lu: true },
      { t: 'Thomas Leroy a modifié les délais', d: 'Couronne sur implant : 12 à 10 j ouvrés.', quand: '3 oct.', type: 'info', lu: true },
    ] as Notif[],
    visites: [6, 8, 7, 10, 9, 12, 11, 13, 10, 14, 15, 12, 16, 18, 14, 17, 19, 16, 20, 18, 21, 19, 22, 24, 20, 23, 25, 22, 26, 28],
    total: '312', evolution: '+18 %',
    actions: [['Appels au laboratoire', '41'], ['Demandes de premier travail', '9'], ['Site du laboratoire', '37'], ['Itinéraires', '12']],
    filtres: [['Zircone', 44], ['Implantologie', 31], ['Empreintes STL', 28], ['Ramassage', 22], ['Délais affichés', 17]],
    sources: [['Recherche DentalMap', 63], ['Google', 26], ['Lien court et badge', 11]],
    parrain: 'Inviter un laboratoire', parrainChamp: 'Nom ou numéro SIREN',
    registreTitre: 'Base Sirene, INSEE',
    registre: [['Dénomination', 'Laboratoire Artemis Dentaire'], ['SIREN', '8XX XXX XXX'], ['SIRET du siège', '8XX XXX XXX XXXXX'], ['Activité principale', 'Fabrication de prothèses dentaires (32.50A)'], ['État', 'Établissement ouvert'], ['Adresse', '8 Avenue de la Somme, 33700 Mérignac'], ['Dernière synchronisation', '28 septembre 2026, aucun changement']] as [string, string][],
    connexion: [['Code à 6 chiffres par courriel', 'Activé', true], ['Clé d’accès sur cet appareil', 'Non configurée', false]] as [string, string, boolean][],
    email: 's.marchand@artemis-dentaire.fr',
  },
  etablissement: {
    sujet: 'page', lien: 'dentalmap.fr/p/ecole-prothese-bdx', site: 'ecole-prothese-bordeaux.fr',
    notifs: [
      { t: 'Calendrier de candidature 2027 à renseigner', d: 'Les candidats de Parcoursup arrivent en janvier.', quand: 'Aujourd’hui', type: 'action' },
      { t: 'Résultats de la session 2025 publiés', d: '92 % de réussite au BTS, repris automatiquement.', quand: '9 oct.', type: 'registre' },
      { t: 'Claire Martin a ajouté 4 photos à la galerie', d: 'Une photo n’a pas de légende.', quand: 'Hier', type: 'info', lu: true },
      { t: 'Référentiel UAI synchronisé, aucun changement', d: 'Statut et adresse inchangés.', quand: '28 sept.', type: 'registre', lu: true },
    ] as Notif[],
    visites: [20, 24, 22, 28, 30, 27, 33, 35, 31, 38, 36, 40, 42, 39, 44, 47, 43, 49, 46, 52, 55, 51, 58, 54, 60, 63, 59, 66, 62, 70],
    total: '1 240', evolution: '+41 %',
    actions: [['Site de l’établissement', '186'], ['Appels', '64'], ['Portes ouvertes consultées', '312'], ['Formations ouvertes', '540']],
    filtres: [['Alternance', 46], ['BTS', 28], ['Bac pro', 21], ['Gironde', 18], ['Internat', 6]],
    sources: [['Recherche DentalMap', 48], ['Google', 39], ['Lien court et badge', 13]],
    parrain: 'Recommander un établissement', parrainChamp: 'Nom ou numéro UAI',
    registreTitre: 'Référentiels publics',
    registre: [['Numéro UAI', '0331XXXX'], ['SIRET', '7XX XXX XXX XXXXX'], ['Statut', 'Privé sous contrat avec l’État'], ['Certification Qualiopi', 'Actions de formation par apprentissage, valide jusqu’au 14 mai 2028'], ['Bac pro Technicien en prothèse dentaire', 'RNCP XXXXX, niveau 4'], ['BTS Prothésiste dentaire', 'RNCP XXXXX, niveau 5'], ['BTMS Prothésiste dentaire', 'RNCP XXXXX, niveau 5'], ['Dernière synchronisation', '28 septembre 2026']] as [string, string][],
    connexion: [['Code à 6 chiffres par courriel', 'Activé', true], ['Clé d’accès sur cet appareil', 'Configurée le 3 septembre', true]] as [string, string, boolean][],
    email: 'direction@ecole-prothese-bordeaux.fr',
  },
  faculte: {
    sujet: 'page', lien: 'dentalmap.fr/p/odonto-estuaire', site: 'odontologie.universite-estuaire.fr',
    notifs: [
      { t: 'Horaires du centre de soins du campus manquants', d: 'Le centre reste affiché avec « Horaires non communiqués ».', quand: 'Aujourd’hui', type: 'action' },
      { t: 'Postes d’internat 2026 publiés', d: '9 postes, repris de l’arrêté du Centre national de gestion.', quand: '8 oct.', type: 'registre' },
      { t: 'Téléphone du centre de soins du centre-ville vérifié', d: 'Il répond, aucune action.', quand: '1er oct.', type: 'info', lu: true },
      { t: 'Capacités d’accueil 2026 publiées', d: '98 places en deuxième année.', quand: '2 avril', type: 'registre', lu: true },
    ] as Notif[],
    visites: [40, 45, 42, 51, 48, 55, 60, 57, 62, 66, 61, 70, 74, 69, 78, 82, 77, 85, 80, 88, 92, 87, 95, 90, 98, 102, 96, 105, 100, 110],
    total: '2 860', evolution: '+27 %',
    actions: [['Rendez-vous aux centres de soins', '412'], ['Accès aux études consulté', '930'], ['Site de la faculté', '355'], ['Itinéraires', '148']],
    filtres: [['Soins à tarif conventionné', 41], ['PASS et L.AS', 30], ['Orthodontie', 14], ['Enfants', 9], ['Passerelles', 6]],
    sources: [['Recherche DentalMap', 37], ['Google', 52], ['Lien court et badge', 11]],
    parrain: 'Recommander une faculté', parrainChamp: 'Nom de l’université',
    registreTitre: 'Référentiels et arrêtés publics',
    registre: [['Numéro UAI', '0331XXXX'], ['SIRET de l’université', '1XX XXX XXX XXXXX'], ['Statut', 'Établissement public à caractère scientifique, culturel et professionnel'], ['Diplôme d’État de docteur en chirurgie dentaire', 'Inscrit au RNCP'], ['Places en 2e année 2026', '98, arrêté du 2 avril 2026'], ['Postes d’internat 2026', '9, arrêté du Centre national de gestion'], ['Dernière synchronisation', '8 octobre 2026']] as [string, string][],
    connexion: [['Code à 6 chiffres par courriel', 'Activé', true], ['Connexion par l’annuaire de l’université', 'Non disponible pour l’instant', false]] as [string, string, boolean][],
    email: 'communication@odontologie.universite-estuaire.fr',
  },
} as const

const TYPE = {
  action: ['À faire', 'bg-amber-50 text-amber-700 ring-amber-200'],
  registre: ['Registre', 'bg-bg text-fg ring-line'],
  fraicheur: ['Fraîcheur', 'bg-teal/10 text-teal ring-teal/30'],
  info: ['Activité', 'bg-bg-soft text-fg-2 ring-line'],
} as const

/* ================================ Notifications ================================ */
export function Notifications({ profil }: { profil: Profil }) {
  const D = P[profil]
  return (
    <Coque profil={profil} actif="notifications" titre="Notifications" sousTitre={`Ce qui demande votre attention, et ce qui s’est passé sur votre ${D.sujet}`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="flex flex-wrap gap-2">
            {['Toutes', 'À faire', 'Registre', 'Fraîcheur', 'Activité'].map((f, i) => (
              <span key={f} className={`squircle-full px-3 py-1.5 text-sm ${i === 0 ? 'bg-fg text-bg' : 'border border-line text-fg-2'}`}>
                {f}
              </span>
            ))}
          </div>
          <ul className="squircle-2xl mt-4 divide-y divide-line border border-line bg-bg">
            {D.notifs.map((n) => (
              <li key={n.t} className={`flex flex-wrap items-start gap-4 p-5 ${n.lu ? '' : 'bg-teal/[0.03]'}`}>
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.lu ? 'bg-transparent' : 'bg-teal'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-fg ${n.lu ? '' : 'font-semibold'}`}>{n.t}</p>
                  <p className="mt-0.5 text-sm text-fg-2">{n.d}</p>
                </div>
                <span className={`squircle-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TYPE[n.type][1]}`}>{TYPE[n.type][0]}</span>
                <span className="w-20 text-right text-sm text-fg-2">{n.quand}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-medium text-fg">Tout marquer comme lu</p>
        </div>
        <Tuile>
          <TitreTuile i={Mail}>Par courriel</TitreTuile>
          <ul className="mt-4 space-y-4 text-sm">
            {[
              ['Actions à faire et rappels de fraîcheur', 'Dès qu’ils arrivent', true],
              ['Changements dans le registre', 'Dès qu’ils arrivent', true],
              ['Résumé de l’activité', 'Une fois par mois', true],
              ['Activité de l’équipe', 'Jamais', false],
            ].map(([t, d, on]) => (
              <li key={t as string} className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-fg">{t as string}</span>
                  <span className="block text-xs text-fg-2">{d as string}</span>
                </span>
                <span className={`relative h-6 w-10 shrink-0 rounded-full ${on ? 'bg-teal' : 'bg-line'}`}>
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${on ? 'right-0.5' : 'left-0.5'}`} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-fg-2">Envoyés à {D.email}. Jamais de courriel commercial.</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ================================ Statistiques ================================ */
export function Statistiques({ profil }: { profil: Profil }) {
  const D = P[profil]
  const max = Math.max(...D.visites)
  return (
    <Coque profil={profil} actif="stats" titre="Statistiques" sousTitre={`Les 30 derniers jours · mesure sans cookie ni donnée personnelle`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Tuile>
          <TitreTuile i={TrendingUp} droite={<span className="squircle-full flex bg-bg-soft p-0.5 text-xs"><span className="px-2.5 py-1 text-fg-2">7 j</span><span className="squircle-full bg-fg px-2.5 py-1 text-bg">30 j</span><span className="px-2.5 py-1 text-fg-2">12 mois</span></span>}>
            Visites de la {D.sujet}
          </TitreTuile>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-4xl font-semibold tracking-tight text-fg">{D.total}</p>
            <span className="squircle-full bg-teal/10 px-2 py-0.5 text-sm font-medium text-teal">{D.evolution}</span>
            <span className="text-sm text-fg-2">par rapport aux 30 jours précédents</span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-1">
            {D.visites.map((v, i) => (
              <span key={i} className={`flex-1 rounded-t ${i === D.visites.length - 1 ? 'bg-teal' : 'bg-teal/30'}`} style={{ height: Math.round((v / max) * 180) }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-fg-2">
            <span>13 sept.</span>
            <span>12 oct.</span>
          </div>
        </Tuile>
        <Tuile>
          <TitreTuile i={Globe}>D’où viennent les visites</TitreTuile>
          <ul className="mt-5 space-y-4 text-sm">
            {D.sources.map(([s, p]) => (
              <li key={s}>
                <div className="flex justify-between">
                  <span className="text-fg">{s}</span>
                  <span className="font-semibold tabular-nums text-fg">{p} %</span>
                </div>
                <span className="mt-1.5 block h-1.5 rounded-full bg-line">
                  <span className="block h-full rounded-full bg-teal" style={{ width: `${p}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </Tuile>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={MousePointerClick}>Ce que font les visiteurs</TitreTuile>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            {D.actions.map(([k, v]) => (
              <div key={k} className="squircle-xl bg-bg-soft p-4">
                <dt className="text-sm text-fg-2">{k}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </Tuile>
        <Tuile>
          <TitreTuile i={Search}>Les filtres qui vous ont trouvé</TitreTuile>
          <ul className="mt-4 space-y-3 text-sm">
            {D.filtres.map(([f, p]) => (
              <li key={f} className="grid grid-cols-[10rem_1fr_3rem] items-center gap-3">
                <span className="text-fg">{f}</span>
                <span className="block h-1.5 rounded-full bg-line">
                  <span className="block h-full rounded-full bg-teal" style={{ width: `${p * 2}%` }} />
                </span>
                <span className="text-right tabular-nums text-fg-2">{p} %</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-2">Part des visites venues d’une recherche avec ce filtre. Votre place dans les résultats ne dépend que de la distance.</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ============================ Partager et parrainer ============================ */
export function Partager({ profil }: { profil: Profil }) {
  const D = P[profil]
  return (
    <Coque profil={profil} actif="partager" titre="Partager et parrainer" sousTitre={`Faire connaître la ${D.sujet} hors de DentalMap. Le partage ne change pas votre place dans les résultats`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Link2} droite={<span className="squircle-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">Le plus efficace</span>}>
            Votre lien court
          </TitreTuile>
          <span className="squircle-lg mt-4 flex h-11 items-center gap-2 border border-line bg-bg-soft px-3 font-mono text-sm text-fg">
            {D.lien} <Copy className="ml-auto size-4 text-fg-2" aria-hidden />
          </span>
          <ol className="mt-5 space-y-3 text-sm">
            {['Ouvrez votre fiche d’établissement Google', 'Collez le lien dans « Site web » ou dans un post', 'Les visites apparaissent dans Statistiques sous 48 heures'].map((e, i) => (
              <li key={e} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-bg-soft text-xs font-semibold text-fg">{i + 1}</span>
                <span className="text-fg">{e}</span>
              </li>
            ))}
          </ol>
        </Tuile>
        <Tuile>
          <TitreTuile i={Globe}>Badge pour {D.site}</TitreTuile>
          <div className="squircle-xl mt-4 flex items-center justify-center bg-bg-soft p-6">
            <span className="squircle-full inline-flex items-center gap-2 border border-line bg-bg px-4 py-2 text-sm font-medium text-fg">
              <ShieldCheck className="size-4 text-teal" aria-hidden /> Vérifié sur DentalMap
            </span>
          </div>
          <pre className="squircle-lg mt-3 overflow-hidden whitespace-pre-wrap bg-[#0e1317] p-3 font-mono text-[11px] leading-relaxed text-white/80">{`<a href="https://${D.lien}">Vérifié sur DentalMap</a>`}</pre>
          <p className="mt-2 text-xs text-fg-2">Un lien HTML simple, sans script : il compte comme un lien vers votre {D.sujet} pour les moteurs.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={QrCode}>Réseaux sociaux</TitreTuile>
          <p className="mt-3 text-sm text-fg-2">Un visuel prêt à publier, avec votre lien et un code QR, au format carré ou story.</p>
          <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg">Télécharger le visuel</span>
        </Tuile>
        <Tuile>
          <TitreTuile i={UserPlus}>{D.parrain}</TitreTuile>
          <span className="squircle-lg mt-4 flex h-11 items-center gap-2 border border-line px-3 text-sm text-fg-2">
            <Search className="size-4" aria-hidden /> {D.parrainChamp}
          </span>
          <p className="mt-3 text-sm text-fg-2">Une invitation à revendiquer sa fiche. Aucun effet sur votre place ni sur la sienne.</p>
        </Tuile>
        <Tuile className="lg:col-span-2">
          <TitreTuile i={Send}>Visites venues de vos liens, 30 derniers jours</TitreTuile>
          <div className="mt-5 grid gap-6 sm:grid-cols-4">
            {[
              [D.sources[2][1] + ' %', 'des visites'],
              ['58 %', 'depuis Google'],
              ['30 %', 'depuis les réseaux'],
              ['12 %', 'depuis le badge du site'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-semibold tracking-tight text-fg">{v}</p>
                <p className="text-sm text-fg-2">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-fg-2">Sans cookie : seule l’origine du clic est gardée.</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ================================== Registre ================================== */
export function RegistreCommun({ profil }: { profil: Profil }) {
  const D = P[profil]
  return (
    <Coque profil={profil} actif="registres" titre="Registres" sousTitre={`Ce que disent les sources publiques, synchronisé chaque semaine`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Tuile>
          <TitreTuile i={ShieldCheck} droite={<span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> Lecture seule</span>}>
            {D.registreTitre}
          </TitreTuile>
          <dl className="mt-4 divide-y divide-line text-sm">
            {D.registre.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[18rem_1fr] sm:gap-6">
                <dt className="text-fg-2">{k}</dt>
                <dd className={/UAI|SIRE|RNCP X/.test(k + v) && /\d|X/.test(v) && v.length < 24 ? 'font-mono text-fg' : 'text-fg'}>{v}</dd>
              </div>
            ))}
          </dl>
        </Tuile>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={RefreshCw}>Synchronisation</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Chaque semaine, ces données sont relues à la source. Un changement apparaît dans Notifications et met à jour la {D.sujet} automatiquement.</p>
          </Tuile>
          <Tuile>
            <TitreTuile i={ShieldCheck}>Une erreur ?</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">La correction se fait auprès de l’organisme qui tient la source. DentalMap la reprend à la synchronisation suivante.</p>
            <span className="mt-4 inline-flex text-sm font-medium text-fg underline underline-offset-4">Signaler un écart</span>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ============================== Compte et sécurité ============================== */
export function CompteCommun({ profil }: { profil: Profil }) {
  const D = P[profil]
  return (
    <Coque profil={profil} actif="compte" titre="Compte et sécurité" sousTitre="Votre connexion à l’espace pro">
      <div className="grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Mail}>Adresse et mot de passe</TitreTuile>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <dt className="text-fg-2">Adresse électronique</dt>
                <dd className="text-fg">{D.email}</dd>
              </div>
              <span className="text-sm font-medium text-fg underline underline-offset-4">Modifier</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <dt className="text-fg-2">Mot de passe</dt>
                <dd className="text-fg">Modifié il y a 2 mois</dd>
              </div>
              <span className="text-sm font-medium text-fg underline underline-offset-4">Changer</span>
            </div>
          </dl>
        </Tuile>
        <Tuile>
          <TitreTuile i={KeyRound}>Connexion renforcée</TitreTuile>
          <ul className="mt-4 space-y-3 text-sm">
            {D.connexion.map(([t, d, ok]) => (
              <li key={t} className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-fg">{t}</span>
                  <span className="block text-xs text-fg-2">{d}</span>
                </span>
                <span className={`relative h-6 w-10 shrink-0 rounded-full ${ok ? 'bg-teal' : 'bg-line'}`}>
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${ok ? 'right-0.5' : 'left-0.5'}`} />
                </span>
              </li>
            ))}
          </ul>
        </Tuile>
        <Tuile className="lg:col-span-2">
          <TitreTuile i={Smartphone}>Appareils connectés</TitreTuile>
          <ul className="mt-2 divide-y divide-line text-sm">
            {[
              ['Mac · Safari, Bordeaux', 'Cet appareil'],
              ['iPhone · application web, Bordeaux', 'Il y a 2 jours'],
            ].map(([a, d]) => (
              <li key={a} className="flex items-center justify-between gap-3 py-3">
                <span className="text-fg">{a}</span>
                <span className="text-fg-2">{d}</span>
              </li>
            ))}
          </ul>
          <span className="mt-3 inline-flex text-sm font-medium text-fg underline underline-offset-4">Déconnecter les autres appareils</span>
        </Tuile>
        <Tuile className="lg:col-span-2">
          <TitreTuile i={Bell}>Quitter l’espace pro</TitreTuile>
          <p className="mt-3 text-sm text-fg-2">Vous pouvez céder la gestion à un autre membre de l’équipe, ou rendre la {D.sujet} à son état d’origine : les informations déclarées sont alors retirées, celles des registres restent.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium text-fg">Céder la gestion</span>
            <span className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium text-fg-2">Ne plus gérer la {D.sujet}</span>
          </div>
        </Tuile>
      </div>
    </Coque>
  )
}

