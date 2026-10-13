/** MAQUETTE. États du parcours dans la coque commune : missions, retours, célébration, distinctions, équipe. */
import Image from 'next/image'
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Crop,
  FileCheck2,
  ImagePlus,
  Lock,
  Mail,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserPlus,
  X,
} from 'lucide-react'
import { Coque, Tuile, TitreTuile, type Profil } from './_coque'
import { Activite, Apercu, FraicheurTuile, Missions, TuileSombre } from './_commun'

/* ------------------------------ Panneau de mission ------------------------------ */
function PanneauMission({ titre, meta, intro, children, apercu, bouton = 'Enregistrer' }: { titre: string; meta: string; intro: string; children: React.ReactNode; apercu?: React.ReactNode; bouton?: string }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="squircle-2xl border border-line bg-bg">
        <div className="border-b border-line p-6">
          <p className="text-xs text-fg-2">{meta}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{titre}</h2>
          <p className="mt-2 max-w-2xl text-fg-2">{intro}</p>
        </div>
        <div className="p-6">{children}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-6">
          <span className="text-sm text-fg-2">Plus tard</span>
          <span className="inline-flex h-11 items-center rounded-full bg-action px-6 text-sm font-semibold text-action-foreground">{bouton}</span>
        </div>
      </section>
      {apercu}
    </div>
  )
}

function ApercuCarte({ photo }: { photo?: string }) {
  return (
    <Apercu onglets={['Recherche', 'Fiche']}>
      <div className="squircle-xl overflow-hidden border border-line bg-bg-soft">
        <div className="relative aspect-video bg-line">
          {photo ? (
            <Image src={photo} alt="" fill sizes="22rem" className="object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-xs text-fg-2">Photo du cabinet</span>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-fg">Dr Martin Dupont</p>
          <p className="text-xs text-fg-2">12 Rue Sainte-Catherine, 33000 Bordeaux</p>
        </div>
      </div>
    </Apercu>
  )
}

/* ============================== MIS-1 · Photo du cabinet ============================== */
export function MisPhoto() {
  return (
    <Coque profil="dentiste" actif="missions" titre="Missions" sousTitre="Photo du cabinet · +12 % · 2 min">
      <PanneauMission
        titre="Photo du cabinet"
        meta="Mission recommandée · +12 % · 2 min"
        intro="Une photo de l’entrée ou de la salle de soins, au format paysage. Elle s’affiche sur la fiche, dans les résultats et dans Google."
        apercu={<ApercuCarte photo="/images/demo/pexels-6627320.jpg" />}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <div className="squircle-2xl relative aspect-video overflow-hidden border border-line">
              <Image src="/images/demo/pexels-6627320.jpg" alt="" fill sizes="50vw" className="object-cover" />
              <div className="absolute inset-[8%] rounded-xl border-2 border-dashed border-white/80" />
              <span className="squircle-full absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/60 px-3 py-1 text-xs text-white">
                <Crop className="size-3.5" aria-hidden /> Cadrage 16:9, déplacez pour ajuster
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 font-medium text-fg">
                <Upload className="size-4" aria-hidden /> Remplacer
              </span>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-fg-2">
                <Trash2 className="size-4" aria-hidden /> Retirer
              </span>
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <p className="font-semibold text-fg">Ce qui fonctionne</p>
            <ul className="space-y-2 text-fg-2">
              {['L’entrée du cabinet ou la salle de soins', 'De la lumière naturelle', 'Aucun patient reconnaissable', 'Pas de texte ni de logo ajouté'].map((c) => (
                <li key={c} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {c}
                </li>
              ))}
            </ul>
            <label className="squircle-xl flex items-start gap-3 bg-bg-soft p-3 text-fg-2">
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded bg-teal text-white">
                <CheckCircle2 className="size-3" aria-hidden />
              </span>
              Je détiens les droits de cette photo.
            </label>
          </div>
        </div>
      </PanneauMission>
    </Coque>
  )
}

/* ============================== MIS-2 · Présentation ============================== */
export function MisPresentation() {
  return (
    <Coque profil="dentiste" actif="missions" titre="Missions" sousTitre="Présentation · +10 % · 5 min">
      <PanneauMission
        titre="Présentation"
        meta="Mission · +10 % · 5 min"
        intro="Votre approche, l’organisation du cabinet, ce qu’un patient doit savoir avant de venir. Pas de promesse de résultat ni de comparaison."
        apercu={
          <Tuile>
            <TitreTuile i={Sparkles}>Conseils</TitreTuile>
            <ul className="mt-4 space-y-3 text-sm text-fg-2">
              <li>Commencez par ce qui distingue l’accueil : deux fauteuils, urgences en fin de matinée, enfants reçus.</li>
              <li>Parlez de vos domaines de soins sans les présenter comme des spécialités.</li>
              <li>Évitez les superlatifs : le Code de déontologie interdit la publicité comparative.</li>
            </ul>
          </Tuile>
        }
      >
        <div className="squircle-xl border border-line p-4 text-[15px] leading-relaxed text-fg">
          Cabinet de deux fauteuils au cœur de Bordeaux, à deux pas du tram B. Nous assurons les soins courants, la parodontologie et la pose d’implants, et nous recevons volontiers les
          enfants. Les urgences du jour sont prises en fin de matinée, sur appel au cabinet. Nous proposons{' '}
          <mark className="rounded bg-amber-100 px-0.5 text-amber-800 underline decoration-amber-500 decoration-wavy">les meilleurs soins</mark> de la ville
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="size-4" aria-hidden /> « les meilleurs soins » : terme comparatif refusé, la présentation reste à 0 point tant qu’il est présent.
          </p>
          <p className="tabular-nums text-fg-2">412 / 800 caractères · minimum 200</p>
        </div>
      </PanneauMission>
    </Coque>
  )
}

/* ============================== DASH-2 · Retour à 82 % ============================== */
export function DashRetour() {
  return (
    <Coque profil="dentiste" actif="vue" titre="Vue d’ensemble" sousTitre="Jeudi 15 octobre · photo ajoutée mardi">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette="Fiche en ligne"
          titre="Bon retour Dr Dupont"
          texte="La photo du cabinet est en ligne : votre fiche apparaît désormais avec une image dans les résultats et dans Google. Encore 8 % pour le palier Exemplaire."
          pct={82}
          legende="→ 92 % possible"
          chiffres={[
            ['7 sur 8', 'filtres patients actifs'],
            ['1 sur 4', 'missions faites'],
            ['+18', 'visites depuis la photo'],
            ['2', 'lieux d’exercice'],
          ]}
          action={{ meta: '+10 % · 5 min', t: 'Écrire la présentation', i: Sparkles }}
        />
        <ApercuCarte photo="/images/demo/pexels-6627320.jpg" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Missions
          items={[
            { t: 'Présentation', d: '5 min', gain: '+10 %', reco: true },
            { t: 'Domaines de soins', d: '1 min', gain: '+8 %' },
            { t: 'Liens du cabinet', d: '1 min', gain: 'Hors barème' },
          ]}
        />
        <FraicheurTuile
          items={[
            { k: 'Horaires', v: 'Rappel dans 69 jours', p: 0.08 },
            { k: 'Photo du cabinet', v: 'Valable 2 ans', p: 0.01 },
            { k: 'Accueil', v: 'Valable 12 mois', p: 0.04 },
          ]}
        />
        <Activite
          items={[
            ['Photo du cabinet publiée', 'Mardi'],
            ['Mission terminée : +12 %', 'Mardi'],
            ['Fiche publiée', '11 oct.'],
          ]}
        />
      </div>
    </Coque>
  )
}

/* ============================== J · Célébration ============================== */
export function Celebration() {
  return (
    <div className="relative">
      <DashExemplaire pct={92} />
      <div className="absolute inset-0 bg-[#0e1317]/55" />
      <div className="absolute inset-x-0 top-24 flex justify-center px-4">
        <div className="squircle-2xl w-full max-w-md bg-bg p-8 text-center shadow-pop">
          <div className="mx-auto flex w-fit gap-2 text-amber-500">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-3 fill-current" aria-hidden />
            ))}
          </div>
          <span className="mx-auto mt-6 grid size-24 place-items-center rounded-full border-4 border-teal text-3xl font-semibold text-fg">92 %</span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal">Palier atteint</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">Votre fiche est exemplaire</h2>
          <p className="mt-2 text-fg-2">Les patients ont tout ce qu’il leur faut pour vous choisir et venir. Votre place dans la liste ne change pas : elle reste fixée par la distance.</p>
          <div className="squircle-xl mt-6 flex items-center gap-3 bg-amber-50 p-4 text-left ring-1 ring-amber-200">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-amber-500 text-amber-700">
              <Award className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-fg">Distinction « Fiche exemplaire »</p>
              <p className="text-xs text-fg-2">Privée : visible dans votre espace seulement.</p>
            </div>
          </div>
          <span className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground">
            <Share2 className="size-4" aria-hidden /> Partager ma fiche
          </span>
          <span className="mt-3 block text-sm font-medium text-fg">Revenir au tableau de bord</span>
        </div>
      </div>
    </div>
  )
}

/* ============================== DASH-3 · Fiche exemplaire ============================== */
export function DashExemplaire({ pct = 100 }: { pct?: number }) {
  const complet = pct === 100
  return (
    <Coque profil="dentiste" actif="vue" titre="Vue d’ensemble" sousTitre="Lundi 2 novembre · fiche exemplaire depuis le 20 octobre">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette="Fiche exemplaire"
          titre={complet ? 'Tout est en place, Dr Dupont' : 'Plus qu’une mission, Dr Dupont'}
          texte={
            complet
              ? 'Il n’y a plus rien à compléter. Le travail devient l’entretien : reconfirmer quand on vous le demande, et faire connaître la fiche.'
              : 'Les domaines de soins ouvriraient le dernier filtre patients.'
          }
          pct={pct}
          legende="force de fiche"
          chiffres={[
            ['8 sur 8', 'filtres patients actifs'],
            [complet ? '4 sur 4' : '3 sur 4', 'missions faites'],
            ['412', 'visites ce mois-ci'],
            ['184', 'venues de vos liens'],
          ]}
          action={complet ? { meta: 'Visibilité · 2 min', t: 'Mettre votre lien dans la fiche Google', i: Send } : { meta: '+8 % · 1 min', t: 'Domaines de soins', i: Sparkles }}
        />
        <ApercuCarte photo="/images/demo/pexels-6627320.jpg" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <FraicheurTuile
          items={[
            { k: 'Horaires', v: 'Rappel dans 51 jours', p: 0.3 },
            { k: 'Présentation', v: 'Valable 11 mois', p: 0.08 },
            { k: 'Photo du cabinet', v: 'Valable 2 ans', p: 0.02 },
          ]}
          note="L’entretien garde la fiche exemplaire : sans reconfirmation, les points baissent."
        />
        <Tuile>
          <TitreTuile i={Send}>Visibilité hors DentalMap</TitreTuile>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ['Lien dans la fiche Google', 'À faire', false],
              ['Badge sur le site du cabinet', 'En place', true],
              ['Visuel pour les réseaux', 'À faire', false],
            ].map(([t, v, ok]) => (
              <li key={t as string} className="flex justify-between gap-3">
                <span className="text-fg">{t as string}</span>
                <span className={ok ? 'text-teal' : 'text-fg-2'}>{v as string}</span>
              </li>
            ))}
          </ul>
        </Tuile>
        <Tuile>
          <TitreTuile i={Award} droite={<span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> Privées</span>}>
            Distinctions
          </TitreTuile>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-fg">6 sur 8</p>
          <p className="text-sm text-fg-2">Prochaine : Toujours à jour, après une année sans retard.</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ============================== DIST · Distinctions ============================== */
const DIST = [
  ['Fiche vérifiée', 'Identité confirmée', true],
  ['Identifié PSC', 'Connexion par Pro Santé Connect', true],
  ['Horaires complets', 'Sept jours renseignés', true],
  ['Cabinet accessible', 'Accès renseigné', true],
  ['Bilingue', 'Au moins deux langues', true],
  ['Fiche exemplaire', 'Palier à 90 %', true],
  ['Toujours à jour', 'Un an sans retard de reconfirmation', false],
  ['Multi-lieux', 'Tous les lieux d’exercice complétés', false],
] as const

export function Distinctions() {
  return (
    <Coque profil="dentiste" actif="distinctions" titre="Distinctions" sousTitre="Privées : elles ne s’affichent jamais aux patients et ne changent pas votre place">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DIST.map(([t, d, ok]) => (
          <div key={t} className={`squircle-2xl flex flex-col items-center border p-6 text-center ${ok ? 'border-line bg-bg' : 'border-dashed border-line bg-bg-soft'}`}>
            <span className={`grid size-16 place-items-center rounded-full ${ok ? 'border-2 border-amber-500 bg-amber-50 text-amber-700' : 'border border-dashed border-line text-fg-2'}`}>
              {ok ? <Award className="size-7" aria-hidden /> : <Lock className="size-6" aria-hidden />}
            </span>
            <p className="mt-4 font-semibold text-fg">{t}</p>
            <p className="mt-1 text-sm text-fg-2">{d}</p>
            <p className={`mt-3 text-xs ${ok ? 'text-teal' : 'text-fg-2'}`}>{ok ? 'Obtenue' : 'À obtenir'}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-fg-2">6 distinctions sur 8. Elles récompensent une fiche juste et à jour, rien d’autre.</p>
    </Coque>
  )
}

/* ============================== U-MIS · Réalisations et ANSM ============================== */
export function LaboMission() {
  return (
    <Coque profil="labo" actif="conformite" titre="Missions" sousTitre="Réalisations et déclaration ANSM · +20 %">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="squircle-2xl border border-line bg-bg p-6">
          <p className="text-xs text-fg-2">Mission · +10 % · 3 min</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg">Vos réalisations</h2>
          <p className="mt-2 text-sm text-fg-2">De une à huit photos de pièces, sans patient reconnaissable. Elles s’affichent dans la présentation de votre fiche.</p>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {['/images/demo/pexels-6627325.jpg', '/images/demo/pexels-7800669.jpg'].map((p) => (
              <div key={p} className="squircle-xl relative aspect-square overflow-hidden border border-line">
                <Image src={p} alt="" fill sizes="10rem" className="object-cover" />
              </div>
            ))}
            {[0, 1].map((i) => (
              <div key={i} className="squircle-xl grid aspect-square place-items-center border-2 border-dashed border-line text-fg-2">
                <ImagePlus className="size-5" aria-hidden />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-fg-2">Crédit photo : Laboratoire Artemis Dentaire</p>
        </section>
        <section className="squircle-2xl border border-line bg-bg p-6">
          <p className="text-xs text-fg-2">Mission · +10 % · 2 min</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-fg">
            <FileCheck2 className="size-5 text-teal" aria-hidden /> Déclaration ANSM
          </h2>
          <p className="mt-2 text-sm text-fg-2">Tout fabricant de dispositifs médicaux sur mesure se déclare auprès de l’ANSM. Indiquez la référence de votre déclaration.</p>
          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="font-medium text-fg">Numéro d’enregistrement</p>
              <span className="squircle-lg mt-1.5 flex h-11 items-center border border-line px-3 font-mono text-fg">FR-MF-XXXXXX</span>
            </div>
            <div>
              <p className="font-medium text-fg">Date de la déclaration</p>
              <span className="squircle-lg mt-1.5 flex h-11 items-center border border-line px-3 text-fg">3 mars 2026</span>
            </div>
            <div className="squircle-xl flex items-center gap-3 border-2 border-dashed border-line p-4 text-fg-2">
              <Upload className="size-5" aria-hidden /> Joindre l’accusé de réception (PDF), vérifié par l’équipe sous 48 heures
            </div>
          </div>
          <span className="mt-6 inline-flex h-11 items-center rounded-full bg-action px-6 text-sm font-semibold text-action-foreground">Envoyer pour vérification</span>
        </section>
      </div>
    </Coque>
  )
}

/* ============================== Équipe (U-COL et autres profils) ============================== */
export function Equipe({ profil = 'labo' }: { profil?: Profil }) {
  const EQUIPES: Record<string, readonly (readonly [string, string, string, boolean])[]> = {
    labo: [
      ['Sophie Marchand', 'Gérante', 'Tous les droits', true],
      ['Thomas Leroy', 'Prothésiste', 'Délais, savoir-faire, réalisations', true],
      ['Inès Benali', 'Secrétariat', 'Zone et logistique, contact', true],
      ['claire.martin@exemple.fr', 'Invitation envoyée', 'Réalisations', false],
    ],
    etablissement: [
      ['Hélène Garnier', 'Direction', 'Tous les droits', true],
      ['Claire Martin', 'Communication', 'Présentation, galerie, événements', true],
      ['Marc Duval', 'Responsable pédagogique', 'Formations, admission', true],
      ['secretariat@exemple.fr', 'Invitation envoyée', 'Contacts, calendrier', false],
    ],
    faculte: [
      ['Pr Anne Lefèvre', 'Doyenne', 'Tous les droits', true],
      ['Service communication', 'Communication', 'Présentation, galerie, événements', true],
      ['Dr Paul Roche', 'Responsable des centres de soins', 'Centres de soins', true],
      ['scolarite@exemple.fr', 'Invitation envoyée', 'Accès aux études, cursus', false],
    ],
  }
  const membres = EQUIPES[profil] ?? EQUIPES.labo
  return (
    <Coque
      profil={profil}
      actif="equipe"
      titre="Équipe"
      sousTitre={`Les personnes qui gèrent la ${profil === 'labo' ? 'fiche' : 'page'}, et ce que chacune peut modifier`}
      action={
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          <UserPlus className="size-4" aria-hidden /> Inviter
        </span>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Tuile className="p-0">
          {membres.map(([n, r, d, actif]) => (
            <div key={n} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-0">
              <span className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${actif ? 'bg-bg-soft text-fg' : 'border border-dashed border-line text-fg-2'}`}>
                {actif ? n.split(' ').filter((x) => /^[A-ZÉ]/.test(x)).slice(0, 2).map((x) => x[0]).join('') : <Mail className="size-4" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-fg">{n}</p>
                <p className="text-sm text-fg-2">{d}</p>
              </div>
              <span className={`squircle-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${actif ? 'bg-bg text-fg ring-line' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>{r}</span>
              {actif ? <span className="text-sm text-fg-2">Modifier</span> : <X className="size-4 text-fg-2" aria-hidden />}
            </div>
          ))}
        </Tuile>
        <Tuile>
          <TitreTuile i={ShieldCheck}>Qui peut quoi</TitreTuile>
          <ul className="mt-4 space-y-3 text-sm text-fg-2">
            <li>Le gérant ou la gérante invite, retire et donne les droits.</li>
            <li>Chaque modification est signée dans l’activité : on sait qui a changé quoi.</li>
            <li>L’identité et les registres ne se modifient par personne ici.</li>
          </ul>
        </Tuile>
      </div>
    </Coque>
  )
}

