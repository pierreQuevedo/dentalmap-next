/** MAQUETTE. Tableau de bord d'un dentiste dans la coque commune : sept écrans. Données d'exemple. */
import Image from 'next/image'
import {
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  ImagePlus,
  KeyRound,
  Link2,
  Lock,
  Mail,
  MapPin,
  Pencil,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from 'lucide-react'
import { Coque, Statut, Tuile, TitreTuile } from './_coque'
import { Activite, Apercu, FraicheurTuile, Missions, TuileSombre } from './_commun'

const MISSIONS = [
  { t: 'Photo du cabinet', d: '2 min', gain: '+12 %', reco: true },
  { t: 'Présentation', d: '5 min', gain: '+10 %' },
  { t: 'Domaines de soins', d: '1 min', gain: '+8 %' },
  { t: 'Liens du cabinet', d: '1 min', gain: 'Hors barème' },
]

/* ============================== Vue d'ensemble ============================== */
export function DentVue() {
  return (
    <Coque profil="dentiste" actif="vue" titre="Vue d’ensemble" sousTitre="Lundi 12 octobre · fiche publiée depuis hier">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette="Fiche en ligne"
          titre="Bonjour Dr Dupont"
          texte="Votre fiche est publiée depuis hier. La photo du cabinet la ferait passer de 70 à 82 %."
          pct={70}
          legende="→ 82 % possible"
          chiffres={[
            ['6 sur 8', 'filtres patients actifs'],
            ['0 sur 4', 'missions faites'],
            ['6 oct.', 'dernière vérification du registre'],
            ['2', 'lieux d’exercice'],
          ]}
          action={{ meta: '+12 % · 2 min', t: 'Ajouter la photo du cabinet', i: ImagePlus }}
        />
        <Apercu onglets={['Patients', 'Google']}>
          <div className="squircle-xl relative overflow-hidden border border-line">
            <div className="relative aspect-[4/5] bg-bg-soft">
              <Image src="/images/fiche-dentiste-homme.png" alt="" fill sizes="22rem" className="object-cover object-[center_26%]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/90 to-transparent p-4 pt-16">
                <p className="text-sm font-semibold text-fg">Dr Martin Dupont</p>
                <p className="text-xs text-fg-2">12 Rue Sainte-Catherine, 33000 Bordeaux</p>
              </div>
            </div>
          </div>
        </Apercu>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Missions items={MISSIONS} />
        <Tuile>
          <TitreTuile i={Search}>Où les patients vous trouvent</TitreTuile>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['Ouvert maintenant', true],
              ['Secteur 1', true],
              ['Tiers payant', true],
              ['Anglais', true],
              ['Accès PMR', true],
              ['Enfants', true],
              ['Domaine de soins', false],
              ['Image dans Google', false],
            ].map(([t, ok]) => (
              <span key={t as string} className={`squircle-full inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ${ok ? 'bg-teal/10 text-teal' : 'border border-dashed border-line text-fg-2'}`}>
                {ok ? <Check className="size-3.5" aria-hidden /> : <Lock className="size-3.5" aria-hidden />} {t as string}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-fg-2">6 filtres actifs sur 8. Les autres s’ouvrent avec les missions.</p>
        </Tuile>
        <FraicheurTuile
          items={[
            { k: 'Horaires', v: 'Rappel dans 73 jours', p: 0.05 },
            { k: 'Conventionnement', v: 'Valable 12 mois', p: 0.03 },
            { k: 'Accueil', v: 'Valable 12 mois', p: 0.03 },
          ]}
          note="Reconfirmer prend un clic, sans ressaisie."
        />
      </div>
      <div className="mt-4">
        <Activite
          items={[
            ['Fiche publiée, visible par les patients', 'Hier'],
            ['Distinction obtenue : Horaires complets', 'Hier'],
            ['Identité confirmée par Pro Santé Connect', '8 oct.'],
            ['Synchronisation Annuaire Santé, aucun changement', '6 oct.'],
          ]}
        />
      </div>
    </Coque>
  )
}

/* ================================== Ma fiche ================================== */
const BLOCS = [
  { n: 'Horaires', d: '7 jours, fermetures comprises', s: 'publiee', src: 'Déclaré' },
  { n: 'Conventionnement et tiers payant', d: 'Secteur 1, tiers payant intégral', s: 'publiee', src: 'Déclaré' },
  { n: 'Langues, accès, enfants', d: 'Français, anglais · accès PMR · dès 3 ans', s: 'publiee', src: 'Déclaré' },
  { n: 'Paiement', d: 'Carte, chèque, espèces', s: 'publiee', src: 'Déclaré' },
  { n: 'Photo du cabinet', d: 'Entrée du cabinet, format 16:9', s: 'vide', src: 'Déclaré' },
  { n: 'Présentation', d: '200 à 800 caractères', s: 'vide', src: 'Déclaré' },
  { n: 'Soins pratiqués', d: 'Au moins deux domaines', s: 'vide', src: 'Déclaré' },
  { n: 'Liens du cabinet', d: 'Site web, prise de rendez-vous en ligne', s: 'vide', src: 'Déclaré' },
  { n: 'Lieux d’exercice', d: 'Bordeaux, Mérignac', s: 'auto', src: 'Annuaire Santé' },
  { n: 'Ce que dit le registre', d: 'RPPS, profession, mode d’exercice', s: 'auto', src: 'Annuaire Santé' },
] as const

export function DentFiche() {
  return (
    <Coque profil="dentiste" actif="fiche" titre="Ma fiche" sousTitre="Les blocs de la fiche publique, dans l’ordre où les patients les lisent">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ol className="space-y-2">
          {BLOCS.map((b, k) => (
            <li key={b.n} className={`squircle-2xl flex flex-wrap items-center gap-4 border bg-bg p-4 ${b.s === 'vide' ? 'border-dashed border-line' : 'border-line'}`}>
              <span className="w-8 text-center text-2xl font-light tabular-nums text-fg-2">{String(k + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{b.n}</p>
                <p className="text-sm text-fg-2">{b.d}</p>
              </div>
              <span className="hidden text-xs text-fg-2 md:block">{b.src}</span>
              <Statut s={b.s} />
              {b.s === 'auto' ? (
                <span className="inline-flex h-9 items-center gap-1.5 px-3 text-sm text-fg-2">
                  <Lock className="size-3.5" aria-hidden /> Lecture seule
                </span>
              ) : (
                <span className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium ${b.s === 'vide' ? 'bg-action text-action-foreground' : 'border border-line text-fg'}`}>
                  <Pencil className="size-3.5" aria-hidden /> {b.s === 'vide' ? 'Remplir' : 'Modifier'}
                </span>
              )}
            </li>
          ))}
        </ol>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={CheckCircle2}>Force de la fiche</TitreTuile>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-fg">70 %</p>
            <p className="text-sm text-fg-2">Palier Avancé · prochain palier à 90 %</p>
            <span className="mt-4 block h-2 rounded-full bg-line">
              <span className="block h-full w-[70%] rounded-full bg-teal" />
            </span>
            <p className="mt-4 text-xs text-fg-2">La force ne change jamais votre place dans les résultats, triés par distance puis par ordre alphabétique.</p>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ================================== Missions ================================== */
export function DentMissions() {
  return (
    <Coque profil="dentiste" actif="missions" titre="Missions" sousTitre="Ce qui reste à compléter, du plus utile au plus rapide">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <ul className="space-y-2">
          {[
            { t: 'Photo du cabinet', d: 'Image sur la fiche et dans Google', gain: '+12 %', m: '2 min' },
            { t: 'Présentation', d: 'Le texte de la fiche, 200 à 800 caractères', gain: '+10 %', m: '5 min' },
            { t: 'Domaines de soins', d: 'Ouvre le filtre par domaine', gain: '+8 %', m: '1 min' },
            { t: 'Liens du cabinet', d: 'Boutons « Site du cabinet » et « Prendre rendez-vous »', gain: 'Hors barème', m: '1 min', actif: true },
          ].map((m) => (
            <li key={m.t} className={`squircle-2xl flex items-center gap-4 border bg-bg p-5 ${m.actif ? 'border-fg shadow-sm' : 'border-line'}`}>
              <span className="grid size-10 place-items-center rounded-full border border-dashed border-line text-fg-2">
                <Clock className="size-4" aria-hidden />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-fg">{m.t}</p>
                <p className="text-sm text-fg-2">
                  {m.d} · {m.m}
                </p>
              </div>
              <span className={`squircle-full px-2.5 py-0.5 text-xs font-medium ${m.gain.startsWith('+') ? 'bg-teal/10 text-teal' : 'bg-bg-soft text-fg-2'}`}>{m.gain}</span>
            </li>
          ))}
          <li className="px-2 pt-3 text-xs font-semibold uppercase tracking-wider text-fg-2">Faites</li>
          {['Horaires', 'Conventionnement et tiers payant', 'Langues, accès, enfants'].map((t) => (
            <li key={t} className="squircle-2xl flex items-center gap-4 border border-line bg-bg-soft p-4 text-sm">
              <CheckCircle2 className="size-5 text-teal" aria-hidden />
              <span className="flex-1 text-fg">{t}</span>
              <span className="text-fg-2">Onboarding</span>
            </li>
          ))}
        </ul>

        <aside className="squircle-2xl border border-line bg-bg shadow-pop">
          <div className="border-b border-line p-5">
            <p className="text-xs text-fg-2">Mission · 1 min</p>
            <p className="text-lg font-semibold text-fg">Liens du cabinet</p>
            <p className="mt-1 text-sm text-fg-2">Deux boutons sur votre fiche. Le lien mène directement chez vous, sans intermédiaire ni suivi.</p>
          </div>
          <div className="space-y-5 p-5">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <Globe className="size-4 text-fg-2" aria-hidden /> Site du cabinet
              </p>
              <span className="squircle-lg mt-1.5 flex h-11 items-center gap-2 border border-line px-3 text-sm text-fg">
                https://cabinet-sainte-catherine.fr
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-teal">
                  <CheckCircle2 className="size-3.5" aria-hidden /> Répond
                </span>
              </span>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <CalendarCheck className="size-4 text-fg-2" aria-hidden /> Prise de rendez-vous en ligne
              </p>
              <span className="squircle-lg mt-1.5 flex h-11 items-center border border-line px-3 text-sm text-fg-2">Collez l’adresse de votre page de rendez-vous</span>
              <p className="mt-1.5 text-xs text-fg-2">Laissez vide si vous ne prenez pas de rendez-vous en ligne : la fiche n’affichera que le téléphone.</p>
            </div>
            <div className="squircle-xl bg-bg-soft p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-2">Sur la fiche</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex h-9 items-center gap-2 rounded-full bg-action px-4 text-xs font-semibold text-action-foreground">Appeler le cabinet</span>
                <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-4 text-xs font-medium text-fg">
                  <Globe className="size-3.5" aria-hidden /> Site du cabinet <ExternalLink className="size-3" aria-hidden />
                </span>
              </div>
            </div>
            <p className="text-xs text-fg-2">Nous testons les liens chaque semaine ; un lien qui ne répond plus est masqué et vous êtes prévenu.</p>
          </div>
          <div className="flex justify-end border-t border-line p-5">
            <span className="inline-flex h-10 items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">Enregistrer</span>
          </div>
        </aside>
      </div>
    </Coque>
  )
}

/* ================================== Fraîcheur ================================== */
export function DentFraicheur() {
  const lignes = [
    { k: 'Horaires', le: 'Confirmés le 11 octobre 2026', etat: 'Rappel le 25 décembre', regle: 'Rappel à 75 jours, points réduits à 90, sortie du filtre « Ouvert maintenant » à 180', p: 0.02 },
    { k: 'Conventionnement et tiers payant', le: 'Confirmés le 11 octobre 2026', etat: 'Valable jusqu’au 11 octobre 2027', regle: 'Reconfirmation annuelle, ou dès qu’il change', p: 0.01 },
    { k: 'Langues, accès, enfants', le: 'Confirmés le 11 octobre 2026', etat: 'Valable jusqu’au 11 octobre 2027', regle: 'Reconfirmation annuelle', p: 0.01 },
    { k: 'Liens du cabinet', le: 'Testés le 12 octobre 2026', etat: 'Site : répond', regle: 'Test automatique chaque semaine', p: 0.01 },
  ]
  return (
    <Coque profil="dentiste" actif="fraicheur" titre="Fraîcheur" sousTitre="Une information ancienne trompe le patient : chaque bloc a sa date et son rappel">
      <ul className="space-y-3">
        {lignes.map((l) => (
          <li key={l.k} className="squircle-2xl grid gap-4 border border-line bg-bg p-5 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="font-semibold text-fg">{l.k}</p>
              <p className="text-sm text-fg-2">{l.le}</p>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-fg">{l.etat}</span>
              </div>
              <span className="mt-2 block h-1.5 rounded-full bg-line">
                <span className="block h-full rounded-full bg-teal" style={{ width: `${Math.max(l.p * 100, 3)}%` }} />
              </span>
              <p className="mt-2 text-xs text-fg-2">{l.regle}</p>
            </div>
            <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg">
              <RefreshCw className="size-4" aria-hidden /> C’est toujours juste
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-fg-2">Reconfirmer ne demande aucune ressaisie. Un rappel arrive par courriel quinze jours avant chaque échéance.</p>
    </Coque>
  )
}

/* ================================== Registre ================================== */
export function DentRegistre() {
  return (
    <Coque profil="dentiste" actif="registres" titre="Registre" sousTitre="Ce que l’Annuaire Santé dit de vous, synchronisé chaque semaine">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile>
            <TitreTuile i={ShieldCheck} droite={<span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> Lecture seule</span>}>
              Identité professionnelle
            </TitreTuile>
            <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ['Nom', 'Dr Martin Dupont'],
                ['Profession', 'Chirurgien-dentiste'],
                ['Numéro RPPS', '10 1XX XXX XXX'],
                ['Spécialité ordinale', 'Aucune déclarée'],
                ['Mode d’exercice', 'Exercice libéral'],
                ['Dernière synchronisation', '6 octobre 2026, aucun changement'],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-fg-2">{k}</dt>
                  <dd className={k === 'Numéro RPPS' ? 'font-mono text-fg' : 'text-fg'}>{v}</dd>
                </div>
              ))}
            </dl>
          </Tuile>
          <Tuile>
            <TitreTuile i={Building2}>Lieux d’exercice</TitreTuile>
            <ul className="mt-4 divide-y divide-line">
              {[
                ['12 Rue Sainte-Catherine, 33000 Bordeaux', 'Lieu principal · géré, horaires renseignés', true],
                ['41 Avenue de la Marne, 33700 Mérignac', 'Second lieu · horaires à renseigner', false],
              ].map(([a, d, ok]) => (
                <li key={a as string} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 text-teal" aria-hidden />
                    <span>
                      <span className="block text-fg">{a as string}</span>
                      <span className={`block text-xs ${ok ? 'text-fg-2' : 'text-amber-700'}`}>{d as string}</span>
                    </span>
                  </span>
                  <span className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-fg">{ok ? 'Modifier' : 'Renseigner'}</span>
                </li>
              ))}
            </ul>
          </Tuile>
        </div>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={ShieldCheck}>Une erreur ?</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Ces données viennent du répertoire partagé des professionnels de santé. Pour les corriger, la mise à jour se fait auprès de l’Ordre ; DentalMap la reprend à la synchronisation suivante.</p>
            <span className="mt-4 inline-flex text-sm font-medium text-fg underline underline-offset-4">Signaler un écart</span>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ============================ Partager et parrainer ============================ */
export function DentPartager() {
  return (
    <Coque profil="dentiste" actif="partager" titre="Partager et parrainer" sousTitre="Faire connaître la fiche hors de DentalMap. Le partage ne change pas votre place dans les résultats">
      <div className="grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Link2} droite={<span className="squircle-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">Le plus efficace</span>}>
            Votre lien court
          </TitreTuile>
          <span className="squircle-lg mt-4 flex h-11 items-center gap-2 border border-line bg-bg-soft px-3 font-mono text-sm text-fg">
            dentalmap.fr/p/dupont-bdx <Copy className="ml-auto size-4 text-fg-2" aria-hidden />
          </span>
          <ol className="mt-5 space-y-3 text-sm">
            {['Ouvrez votre fiche d’établissement Google', 'Collez le lien dans « Site web » ou « Lien de prise de rendez-vous »', 'Enregistrez : les visites apparaissent ici sous 48 heures'].map((e, i) => (
              <li key={e} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-bg-soft text-xs font-semibold text-fg">{i + 1}</span>
                <span className="text-fg">{e}</span>
              </li>
            ))}
          </ol>
        </Tuile>
        <Tuile>
          <TitreTuile i={Globe}>Badge pour le site du cabinet</TitreTuile>
          <div className="squircle-xl mt-4 flex items-center justify-center bg-bg-soft p-6">
            <span className="squircle-full inline-flex items-center gap-2 border border-line bg-bg px-4 py-2 text-sm font-medium text-fg">
              <ShieldCheck className="size-4 text-teal" aria-hidden /> Vérifié sur DentalMap
            </span>
          </div>
          <pre className="squircle-lg mt-3 overflow-hidden whitespace-pre-wrap bg-[#0e1317] p-3 font-mono text-[11px] leading-relaxed text-white/80">{'<a href="https://dentalmap.fr/p/dupont-bdx">Vérifié sur DentalMap</a>'}</pre>
          <p className="mt-2 text-xs text-fg-2">Un lien HTML simple, sans script : il compte comme un lien vers votre fiche pour les moteurs.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={QrCode}>Réseaux sociaux</TitreTuile>
          <p className="mt-3 text-sm text-fg-2">Un visuel prêt à publier, avec votre lien et un code QR, au format carré ou story.</p>
          <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg">Télécharger le visuel</span>
        </Tuile>
        <Tuile>
          <TitreTuile i={UserPlus}>Parrainer un confrère</TitreTuile>
          <span className="squircle-lg mt-4 flex h-11 items-center gap-2 border border-line px-3 text-sm text-fg-2">
            <Search className="size-4" aria-hidden /> Nom ou numéro RPPS
          </span>
          <p className="mt-3 text-sm text-fg-2">Il reçoit une invitation à revendiquer sa fiche. Aucun effet sur votre place ni sur la sienne.</p>
        </Tuile>
        <Tuile className="lg:col-span-2">
          <TitreTuile i={Send}>Visites venues de vos liens, 30 derniers jours</TitreTuile>
          <div className="mt-5 grid gap-6 sm:grid-cols-4">
            {[
              ['184', 'visites au total'],
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
          <p className="mt-4 text-xs text-fg-2">Sans cookie ni donnée patient : seule l’origine du clic est gardée.</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ============================== Compte et sécurité ============================== */
export function DentCompte() {
  return (
    <Coque profil="dentiste" actif="compte" titre="Compte et sécurité" sousTitre="Votre connexion à l’espace pro">
      <div className="grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Mail}>Adresse et mot de passe</TitreTuile>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <dt className="text-fg-2">Adresse électronique</dt>
                <dd className="text-fg">m.dupont@cabinet-sainte-catherine.fr</dd>
              </div>
              <span className="text-sm font-medium text-fg underline underline-offset-4">Modifier</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <dt className="text-fg-2">Mot de passe</dt>
                <dd className="text-fg">Modifié il y a 3 mois</dd>
              </div>
              <span className="text-sm font-medium text-fg underline underline-offset-4">Changer</span>
            </div>
          </dl>
        </Tuile>
        <Tuile>
          <TitreTuile i={KeyRound}>Connexion renforcée</TitreTuile>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ['Code à 6 chiffres par courriel', 'Activé', true],
              ['Pro Santé Connect', 'Lié le 8 octobre 2026', true],
            ].map(([t, d, ok]) => (
              <li key={t as string} className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-fg">{t as string}</span>
                  <span className="block text-xs text-fg-2">{d as string}</span>
                </span>
                <span className={`relative h-6 w-10 rounded-full ${ok ? 'bg-teal' : 'bg-line'}`}>
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
      </div>
    </Coque>
  )
}
