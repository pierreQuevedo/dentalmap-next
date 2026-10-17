/** MAQUETTE. Espace des salariés et des étudiants : offres, candidatures, profil, alertes, visibilité, formation. Données d'exemple. */
import {
  BadgeCheck,
  BellRing,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Euro,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Info,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UserRound,
  Wrench,
} from 'lucide-react'
import { Coque, Tuile, TitreTuile } from './_coque'
import { TuileSombre } from './_commun'
import { BoutonDiscret, BoutonPlein } from './_emploi'

type ProfilCand = 'salarie' | 'etudiant'

type OffreC = {
  poste: string; structure: string; type: 'cabinet' | 'laboratoire'; ville: string; km: string
  contrat: string; temps: string; remu: string; jours: number; verifiee: boolean
}

type CandC = {
  poste: string; structure: string; quand: string
  etape: 0 | 1 | 2 | 3; issue?: 'retenue' | 'non'; echange?: { creneaux: string[] }
}

const OFFRES: Record<ProfilCand, OffreC[]> = {
  salarie: [
    { poste: 'Assistant(e) dentaire qualifié(e)', structure: 'Cabinet Sainte-Catherine', type: 'cabinet', ville: 'Bordeaux', km: '1,2 km', contrat: 'CDI', temps: 'Temps plein', remu: '2 100 à 2 400 €', jours: 6, verifiee: true },
    { poste: 'Assistant(e) dentaire', structure: 'Centre dentaire Bastide Nord', type: 'cabinet', ville: 'Bordeaux', km: '2,8 km', contrat: 'CDI', temps: 'Temps plein', remu: '2 050 à 2 300 €', jours: 2, verifiee: true },
    { poste: 'Assistant(e) dentaire en orthodontie', structure: 'Cabinet d’orthodontie des Ormeaux', type: 'cabinet', ville: 'Le Bouscat', km: '4,1 km', contrat: 'CDI', temps: 'Temps plein', remu: '2 000 à 2 250 €', jours: 9, verifiee: true },
    { poste: 'Secrétaire assistant(e) dentaire', structure: 'Cabinet des Tilleuls', type: 'cabinet', ville: 'Talence', km: '5,3 km', contrat: 'CDI', temps: 'Temps plein', remu: '1 950 à 2 200 €', jours: 12, verifiee: false },
    { poste: 'Assistant(e) dentaire, chirurgie implantaire', structure: 'Cabinet des Acacias', type: 'cabinet', ville: 'Pessac', km: '8,9 km', contrat: 'CDI', temps: 'Temps plein', remu: '2 200 à 2 500 €', jours: 15, verifiee: true },
    { poste: 'Assistant(e) dentaire qualifié(e)', structure: 'Cabinet des Glycines', type: 'cabinet', ville: 'Bègles', km: '11,6 km', contrat: 'CDI', temps: 'Temps plein', remu: '2 050 à 2 350 €', jours: 21, verifiee: true },
  ],
  etudiant: [
    { poste: 'Apprenti(e) BTS prothésiste dentaire', structure: 'Prothèse Céramique Atlantique', type: 'laboratoire', ville: 'Pessac', km: '4,8 km', contrat: 'Alternance 24 mois', temps: 'Rythme 2 et 2', remu: '780 à 1 000 €', jours: 3, verifiee: true },
    { poste: 'Alternance prothèse fixe et CFAO', structure: 'Laboratoire des Graves', type: 'laboratoire', ville: 'Talence', km: '5,6 km', contrat: 'Alternance 24 mois', temps: 'Rythme 2 et 2', remu: '800 à 1 050 €', jours: 5, verifiee: true },
    { poste: 'Stage en laboratoire, 8 semaines', structure: 'Atelier Prothèse Rive Droite', type: 'laboratoire', ville: 'Lormont', km: '7,4 km', contrat: 'Stage', temps: 'Temps plein', remu: '620 à 650 €', jours: 8, verifiee: true },
    { poste: 'Apprenti(e) prothésiste, prothèse amovible', structure: 'Laboratoire Médoc Prothèse', type: 'laboratoire', ville: 'Blanquefort', km: '11,2 km', contrat: 'Alternance 24 mois', temps: 'Rythme 2 et 2', remu: '780 à 980 €', jours: 14, verifiee: false },
  ],
}

const CANDS: Record<ProfilCand, CandC[]> = {
  salarie: [
    { poste: 'Assistant(e) dentaire qualifié(e)', structure: 'Cabinet Sainte-Catherine, Bordeaux', quand: 'Envoyée le 9 octobre', etape: 2, echange: { creneaux: ['Mardi 14 octobre, 18h00', 'Jeudi 16 octobre, 12h30'] } },
    { poste: 'Assistant(e) dentaire', structure: 'Centre dentaire Bastide Nord, Bordeaux', quand: 'Envoyée le 10 octobre', etape: 1 },
    { poste: 'Assistant(e) dentaire en orthodontie', structure: 'Cabinet d’orthodontie des Ormeaux, Le Bouscat', quand: 'Envoyée le 3 octobre', etape: 0 },
    { poste: 'Assistant(e) dentaire qualifié(e)', structure: 'Cabinet des Quatre Vents, Mérignac', quand: 'Envoyée le 18 septembre', etape: 3, issue: 'non' },
  ],
  etudiant: [
    { poste: 'Apprenti(e) BTS prothésiste dentaire', structure: 'Prothèse Céramique Atlantique, Pessac', quand: 'Envoyée le 7 octobre', etape: 2, echange: { creneaux: ['Mercredi 15 octobre, 17h00', 'Samedi 18 octobre, 10h00'] } },
    { poste: 'Alternance prothèse fixe et CFAO', structure: 'Laboratoire des Graves, Talence', quand: 'Envoyée le 9 octobre', etape: 1 },
    { poste: 'Stage en laboratoire, 8 semaines', structure: 'Atelier Prothèse Rive Droite, Lormont', quand: 'Envoyée le 2 octobre', etape: 0 },
  ],
}

const ETAPES = (type: string) => ['Envoyée', `Vue par le ${type}`, 'Échange proposé', 'Retenue']

const Puce = ({ children, on = false }: { children: React.ReactNode; on?: boolean }) => (
  <span className={`squircle-full inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ring-1 ring-inset ${on ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg text-fg-2 ring-line'}`}>
    {on && <Check className="size-3.5" aria-hidden />} {children}
  </span>
)

const Interrupteur = ({ on }: { on: boolean }) => (
  <span className={`relative h-6 w-10 shrink-0 rounded-full ${on ? 'bg-teal' : 'bg-line'}`}>
    <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${on ? 'right-0.5' : 'left-0.5'}`} />
  </span>
)

function FicheVerifiee({ ok }: { ok: boolean }) {
  if (!ok) return null
  return (
    <span className="squircle-full inline-flex items-center gap-1 bg-teal/10 px-1.5 py-0.5 text-[11px] font-medium text-teal ring-1 ring-inset ring-teal/30">
      <BadgeCheck className="size-3" aria-hidden /> Fiche vérifiée
    </span>
  )
}

/** Carte d'une offre, dans la liste et dans les recommandations. */
function CarteOffre({ o, compacte = false }: { o: OffreC; compacte?: boolean }) {
  return (
    <li className={`squircle-2xl flex flex-col border border-line bg-bg ${compacte ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start gap-3">
        <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-bg-soft text-fg-2 ring-1 ring-line">
          {o.type === 'cabinet' ? <Building2 className="size-4" aria-hidden /> : <Wrench className="size-4" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fg">{o.poste}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg">
            {o.structure} <FicheVerifiee ok={o.verifiee} />
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-fg-2">
            <MapPin className="size-3.5" aria-hidden /> {o.ville} · à {o.km}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">{o.contrat}</span>
        <span className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">{o.temps}</span>
        <span className="squircle-full bg-bg-soft px-2.5 py-1 text-xs font-medium text-fg">{o.remu} brut par mois</span>
      </div>
      {!compacte && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-xs text-fg-2">Publiée il y a {o.jours} jours</span>
          <BoutonDiscret>Voir l’offre</BoutonDiscret>
        </div>
      )}
    </li>
  )
}

function Frise({ c, type }: { c: CandC; type: string }) {
  const etapes = ETAPES(type)
  if (c.issue === 'non') etapes[3] = 'Non retenue'
  return (
    <ol className="grid grid-cols-4 gap-1.5">
      {etapes.map((e, i) => {
        const fait = c.issue === 'non' ? i <= 1 : i <= c.etape
        const courant = i === c.etape
        const non = c.issue === 'non' && i === 3
        return (
          <li key={e}>
            <span className={`block h-1.5 rounded-full ${non ? 'bg-fg-2/40' : fait ? 'bg-teal' : 'bg-line'}`} />
            <span className={`mt-1.5 block text-[11px] leading-tight ${courant ? 'font-semibold text-fg' : fait ? 'text-fg-2' : 'text-fg-2/70'}`}>{e}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** Proposition d'échange à accepter. */
function Proposition({ c }: { c: CandC }) {
  if (!c.echange) return null
  return (
    <div className="squircle-xl mt-4 bg-amber-50 p-4 ring-1 ring-amber-200">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
        <MessageSquare className="size-4" aria-hidden /> Proposition d’échange
      </p>
      <p className="mt-1 text-sm text-amber-900/80">
        {c.structure.split(',')[0]} aimerait vous parler. Créneaux proposés :
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {c.echange.creneaux.map((t) => (
          <span key={t} className="squircle-full bg-white px-2.5 py-1 text-xs text-fg ring-1 ring-inset ring-amber-200">{t}</span>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <BoutonPlein>Accepter et partager mes coordonnées</BoutonPlein>
        <BoutonDiscret>Décliner</BoutonDiscret>
      </div>
      <p className="mt-3 text-xs text-amber-900/70">Votre téléphone et votre courriel ne sont transmis qu’après votre accord.</p>
    </div>
  )
}

/* ================================ Vue d'ensemble ================================ */
export function CandVue({ profil }: { profil: ProfilCand }) {
  const etu = profil === 'etudiant'
  const offres = OFFRES[profil].slice(0, 3)
  const cands = CANDS[profil]
  const type = etu ? 'laboratoire' : 'cabinet'
  return (
    <Coque profil={profil} actif="vue" titre="Vue d’ensemble" sousTitre={etu ? 'Lundi 12 octobre · alternance et stages en laboratoire' : 'Lundi 12 octobre · 3 nouvelles offres depuis votre dernière visite'}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette="Profil visible, anonymisé"
          titre={etu ? 'Bonjour Lucas' : 'Bonjour Camille'}
          texte={
            etu
              ? 'Votre profil est visible des laboratoires vérifiés, sans votre nom. Indiquez votre rythme d’alternance pour recevoir des offres qui s’y accordent.'
              : 'Votre profil est visible des cabinets vérifiés, sans votre nom. Ajoutez votre titre pour afficher le badge « Titre vérifié ».'
          }
          pct={80}
          legende="profil complet"
          chiffres={
            etu
              ? [['4', 'offres près de vous'], ['3', 'candidatures en cours'], ['1', 'échange proposé'], ['15 km', 'rayon de recherche']]
              : [['12', 'offres près de vous'], ['3', 'candidatures en cours'], ['1', 'échange proposé'], ['15 km', 'rayon de recherche']]
          }
          action={etu ? { meta: '+10 % · 1 min', t: 'Indiquer votre rythme d’alternance', i: CalendarDays } : { meta: '+10 % · 2 min', t: 'Ajouter votre titre d’assistante dentaire', i: ShieldCheck }}
        />
        <aside className="space-y-4">
          {etu && (
            <Tuile>
              <TitreTuile i={GraduationCap}>Votre formation</TitreTuile>
              <div className="mt-4 flex items-center gap-3">
                <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-white text-[10px] font-bold text-[#0e1317] ring-1 ring-line">EPB</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">École de prothèse dentaire de Bordeaux</p>
                  <p className="text-xs text-fg-2">BTS prothésiste dentaire, 1re année</p>
                </div>
              </div>
              <p className="squircle-xl mt-4 bg-bg-soft p-3 text-sm text-fg">
                Rythme proposé par l’école : <span className="font-semibold">2 semaines à l’école, 2 semaines en entreprise</span>
                <span className="mt-1 block text-xs text-amber-700">À confirmer dans Ma formation</span>
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-fg">
                Voir la page de l’école <ExternalLink className="size-3.5 text-fg-2" aria-hidden />
              </p>
            </Tuile>
          )}
          <Tuile>
            <TitreTuile i={BellRing} droite={<Interrupteur on />}>Alerte active</TitreTuile>
            <p className="mt-4 text-sm font-semibold text-fg">{etu ? 'Alternance en laboratoire' : 'Assistant(e) dentaire, CDI'}</p>
            <p className="mt-1 text-sm text-fg-2">{etu ? 'Alternance ou stage · 15 km autour de Bordeaux' : 'Temps plein · 15 km autour de Bordeaux'}</p>
            <p className="mt-3 text-xs text-fg-2">Chaque matin par courriel · dernière offre envoyée hier</p>
          </Tuile>
        </aside>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Sparkles} droite={<span className="text-sm text-fg">Tout voir</span>}>
            {etu ? 'Alternances et stages pour vous' : 'Offres pour vous'}
          </TitreTuile>
          <ul className="mt-4 space-y-2">
            {offres.map((o) => (
              <CarteOffre key={o.poste + o.structure} o={o} compacte />
            ))}
          </ul>
        </Tuile>
        <Tuile>
          <TitreTuile i={ListChecks} droite={<span className="text-sm text-fg">Tout voir</span>}>
            Candidatures en cours
          </TitreTuile>
          <ul className="mt-2 divide-y divide-line">
            {cands.filter((c) => !c.issue).map((c) => (
              <li key={c.structure} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fg">{c.poste}</p>
                    <p className="text-xs text-fg-2">{c.structure}</p>
                  </div>
                  {c.echange && <span className="squircle-full shrink-0 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">À répondre</span>}
                </div>
                <div className="mt-3">
                  <Frise c={c} type={type} />
                </div>
              </li>
            ))}
          </ul>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ==================================== Offres ==================================== */
export function CandOffres({ profil }: { profil: ProfilCand }) {
  const etu = profil === 'etudiant'
  const offres = OFFRES[profil]
  return (
    <Coque profil={profil} actif="offres" titre={etu ? 'Alternances et stages' : 'Offres pour vous'} sousTitre={etu ? 'En laboratoire, autour de Bordeaux, selon votre profil' : 'Autour de Bordeaux, selon votre profil et vos critères'}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="squircle-full inline-flex items-center gap-1.5 border border-line bg-bg px-3 py-1.5 text-sm text-fg">
          <SlidersHorizontal className="size-3.5" aria-hidden /> Filtres
        </span>
        {(etu
          ? [['Prothésiste dentaire', true], ['Alternance', true], ['Stage', true], ['≤ 15 km', true], ['CDI', false]]
          : [['Assistant(e) dentaire', true], ['CDI', true], ['≤ 15 km', true], ['Temps plein', true], ['Orthodontie', false]]
        ).map(([t, on]) => (
          <Puce key={t as string} on={on as boolean}>{t as string}</Puce>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-fg">
          <span className="font-semibold">{etu ? '4 offres' : '12 offres'}</span> <span className="text-fg-2">correspondent à vos critères</span>
        </p>
        <p className="flex items-center gap-1.5 text-sm text-fg-2">
          <Navigation className="size-3.5" aria-hidden /> Les plus proches d’abord
        </p>
      </div>
      <ul className="mt-3 grid gap-3 lg:grid-cols-2">
        {offres.map((o) => (
          <CarteOffre key={o.poste + o.structure} o={o} />
        ))}
      </ul>
      {!etu && <p className="mt-4 text-center text-sm font-medium text-fg">Afficher 6 offres de plus</p>}
      <p className="mt-4 text-center text-xs text-fg-2">Toutes les offres affichent une rémunération brute mensuelle. Les offres sont triées par distance.</p>
    </Coque>
  )
}

/* =============================== Détail d'une offre =============================== */
const DETAIL = {
  salarie: {
    o: OFFRES.salarie[0], structure: 'cabinet', debut: 'Dès que possible',
    exp: '2 ans souhaités',
    adresse: '12 Rue Sainte-Catherine, 33000 Bordeaux',
    acces: 'Tram A et B, arrêt Sainte-Catherine',
    missions: [
      'Assister le praticien au fauteuil, en omnipratique et en implantologie',
      'Préparer et stériliser les instruments, tenir la traçabilité',
      'Accueillir les patients, gérer l’agenda et les devis',
      'Gérer les commandes et le lien avec le laboratoire',
    ],
    attendu: ['Titre d’assistant(e) dentaire', 'Aisance avec le logiciel de cabinet', 'Goût du travail en équipe'],
    avantages: ['Tickets restaurant', 'Mutuelle prise en charge à 60 %', 'Prime annuelle', 'Samedi libre', 'Formation continue payée'],
    pres: 'Un praticien, deux fauteuils, une assistante en poste. Cabinet en centre-ville, accessible en tram.',
  },
  etudiant: {
    o: OFFRES.etudiant[0], structure: 'laboratoire', debut: 'Rentrée de septembre 2027',
    exp: 'Aucune exigée',
    adresse: '27 Avenue Jean-Jaurès, 33600 Pessac',
    acces: 'Tram B, arrêt Pessac Centre',
    missions: [
      'Couler et préparer les modèles, monter les articulateurs',
      'Participer à la conception des couronnes et bridges en CFAO',
      'Apprendre la stratification céramique avec un tuteur',
      'Suivre la traçabilité de chaque travail',
    ],
    attendu: ['Inscription en BTS prothésiste dentaire', 'Rythme 2 semaines et 2 semaines', 'Minutie et patience'],
    avantages: ['Tuteur céramiste dédié', 'Frais de transport remboursés à 50 %', 'Accès au plateau CFAO', 'Embauche possible après le diplôme'],
    pres: 'Six prothésistes, prothèse fixe céramique et CFAO. Le laboratoire accueille un apprenti chaque année.',
  },
}

export function CandOffre({ profil }: { profil: ProfilCand }) {
  const D = DETAIL[profil]
  const o = D.o
  return (
    <Coque
      profil={profil}
      actif="offres"
      titre={o.poste}
      sousTitre={`${o.structure} · ${o.ville} · publiée il y a ${o.jours} jours`}
      action={<BoutonPlein className="max-lg:hidden">Postuler</BoutonPlein>}
    >
      <p className="-mt-2 mb-4 flex items-center gap-1 text-sm text-fg-2">
        <ChevronLeft className="size-4" aria-hidden /> <span className="font-medium text-fg">{profil === 'etudiant' ? 'Alternances et stages' : 'Offres pour vous'}</span>
      </p>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile>
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                [Briefcase, 'Contrat', o.contrat],
                [Clock, 'Temps de travail', o.temps],
                [CalendarClock, 'Début', D.debut],
                [Euro, 'Rémunération', `${o.remu} brut par mois`],
                [UserRound, 'Expérience', D.exp],
                [MapPin, 'Lieu', `${o.ville}, à ${o.km}`],
              ].map(([I, l, v]) => {
                const Icone = I as typeof Clock
                return (
                  <div key={l as string} className="squircle-xl bg-bg-soft p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-fg-2"><Icone className="size-3.5 shrink-0" aria-hidden /> {l as string}</dt>
                    <dd className="mt-1 text-sm font-medium text-fg">{v as string}</dd>
                  </div>
                )
              })}
            </dl>
          </Tuile>
          <Tuile>
            <TitreTuile i={ListChecks}>Missions</TitreTuile>
            <ul className="mt-4 space-y-2.5 text-sm text-fg">
              {D.missions.map((m) => (
                <li key={m} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {m}
                </li>
              ))}
            </ul>
          </Tuile>
          <div className="grid gap-4 md:grid-cols-2">
            <Tuile>
              <TitreTuile i={UserRound}>Profil recherché</TitreTuile>
              <ul className="mt-4 space-y-2 text-sm text-fg">
                {D.attendu.map((m) => (
                  <li key={m} className="flex items-start gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-fg-2" /> {m}
                  </li>
                ))}
              </ul>
            </Tuile>
            <Tuile>
              <TitreTuile i={Sparkles}>Avantages</TitreTuile>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {D.avantages.map((a) => (
                  <span key={a} className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">{a}</span>
                ))}
              </div>
            </Tuile>
          </div>
        </div>
        <aside className="space-y-4">
          <Tuile>
            <div className="flex items-start gap-3">
              <span className="squircle-lg grid size-11 shrink-0 place-items-center bg-white text-fg ring-1 ring-line">
                {o.type === 'cabinet' ? <Building2 className="size-5" aria-hidden /> : <Wrench className="size-5" aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-fg">{o.structure}</p>
                <div className="mt-1"><FicheVerifiee ok={o.verifiee} /></div>
              </div>
            </div>
            <p className="mt-3 text-sm text-fg-2">{D.pres}</p>
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-fg">
              Voir la fiche du {D.structure} <ChevronRight className="size-4 text-fg-2" aria-hidden />
            </p>
          </Tuile>
          <Tuile className="!p-0">
            <div
              className="relative h-44 overflow-hidden rounded-t-[inherit] bg-bg-soft"
              style={{ backgroundImage: 'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
              aria-hidden
            >
              <span className="absolute left-0 right-0 top-[58%] h-2 -rotate-6 bg-bg" />
              <span className="absolute bottom-0 left-[38%] top-0 w-2 rotate-12 bg-bg" />
              <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-full place-items-center rounded-full bg-fg text-bg shadow-pop">
                <MapPin className="size-4" aria-hidden />
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-fg">{D.adresse}</p>
              <p className="mt-0.5 text-xs text-fg-2">{D.acces} · à {o.km} de chez vous</p>
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={Euro}>Rémunération</TitreTuile>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-fg">{o.remu}</p>
            <p className="text-sm text-fg-2">brut par mois{profil === 'etudiant' ? ', selon votre âge et votre année de formation' : ', selon expérience'}</p>
          </Tuile>
        </aside>
      </div>
      {/* Barre collante en bas en mobile. Posée en fin de page pour que la capture pleine page la montre à sa place. */}
      <div className="-mx-4 -mb-6 mt-6 flex items-center gap-3 border-t border-line bg-bg px-4 py-3 shadow-pop sm:-mx-8 sm:px-8 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{o.remu} brut par mois</p>
          <p className="truncate text-xs text-fg-2">{o.contrat} · {o.ville}</p>
        </div>
        <BoutonPlein className="h-11 px-6">Postuler</BoutonPlein>
      </div>
    </Coque>
  )
}

/* ================================== Candidatures ================================== */
export function CandCandidatures({ profil }: { profil: ProfilCand }) {
  const etu = profil === 'etudiant'
  const type = etu ? 'laboratoire' : 'cabinet'
  const cands = CANDS[profil]
  return (
    <Coque profil={profil} actif="candidatures" titre="Candidatures" sousTitre={`${cands.filter((c) => !c.issue).length} en cours · 1 proposition d’échange à laquelle répondre`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="space-y-3">
          {cands.map((c) => (
            <li key={c.structure} className={`squircle-2xl border border-line bg-bg p-5 ${c.issue === 'non' ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-fg">{c.poste}</p>
                  <p className="text-sm text-fg-2">{c.structure}</p>
                </div>
                <span className="text-xs text-fg-2">{c.quand}</span>
              </div>
              <div className="mt-4">
                <Frise c={c} type={type} />
              </div>
              <Proposition c={c} />
              {c.issue === 'non' && (
                <p className="squircle-xl mt-4 bg-bg-soft p-3 text-xs text-fg-2">
                  Le {type} a pourvu le poste. Votre candidature sera supprimée 6 mois après la clôture de l’offre.
                </p>
              )}
            </li>
          ))}
        </ul>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={Lock}>Vos coordonnées</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">
              Quand vous postulez, le {type} voit votre profil et votre message. Votre téléphone et votre courriel ne lui sont transmis que si vous acceptez un échange.
            </p>
          </Tuile>
          <Tuile>
            <TitreTuile i={Info}>Durée de conservation</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Vos candidatures et votre CV sont supprimés 6 mois après la clôture de l’offre. Vous pouvez retirer une candidature à tout moment.</p>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ==================================== Profil ==================================== */
const PROFIL = {
  salarie: {
    ini: 'CM', nom: 'Camille Martin', ville: 'Bordeaux, quartier Saint-Michel', email: 'c.martin@exemple.fr',
    qualif: 'Assistante dentaire qualifiée', verif: false,
    experiences: [
      ['Assistante dentaire', 'Cabinet d’omnipratique, Bordeaux', '2021 à aujourd’hui'],
      ['Assistante dentaire', 'Centre dentaire, Talence', '2018 à 2021'],
      ['Aide dentaire', 'Cabinet d’orthodontie, Pessac', '2017 à 2018'],
    ],
    competences: [['Assistance au fauteuil', true], ['Implantologie', true], ['Stérilisation et traçabilité', true], ['Radioprotection', true], ['Accueil et agenda', true], ['Devis et tiers payant', false], ['Orthodontie', false]],
    rayon: '15 km', dispo: 'Préavis d’un mois', contrats: [['CDI', true], ['CDD', false], ['Remplacement', false], ['Temps plein', true], ['Temps partiel', false]],
    vu: { titre: 'Assistante dentaire qualifiée', exp: '9 ans d’expérience', lieu: 'Bordeaux, Saint-Michel' },
  },
  etudiant: {
    ini: 'LB', nom: 'Lucas Bernard', ville: 'Bordeaux, quartier Bastide', email: 'l.bernard@exemple.fr',
    qualif: 'Étudiant en BTS prothésiste dentaire, 1re année', verif: true,
    experiences: [
      ['Bac pro Technicien en prothèse dentaire', 'Lycée, Bordeaux', '2023 à 2026'],
      ['Stage de 6 semaines', 'Laboratoire de prothèse fixe, Mérignac', 'Printemps 2026'],
    ],
    competences: [['Coulée et modèles', true], ['Cire et montage', true], ['Initiation CFAO', true], ['Céramique', false], ['Prothèse amovible', false]],
    rayon: '15 km', dispo: 'Rentrée de septembre 2027', contrats: [['Alternance', true], ['Stage', true], ['CDD', false], ['CDI', false]],
    vu: { titre: 'Étudiant en BTS prothésiste dentaire', exp: 'Bac pro et un stage', lieu: 'Bordeaux rive droite' },
  },
}

export function CandProfil({ profil }: { profil: ProfilCand }) {
  const P = PROFIL[profil]
  const etu = profil === 'etudiant'
  return (
    <Coque profil={profil} actif="profil" titre="Mon profil" sousTitre="Ce que les recruteurs voient quand vous postulez ou quand vous êtes visible">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile>
            <TitreTuile i={UserRound} droite={<Pencil className="size-4 text-fg-2" aria-hidden />}>Identité</TitreTuile>
            <div className="mt-4 flex items-center gap-4">
              <span className="squircle-xl grid size-14 shrink-0 place-items-center bg-bg-soft text-base font-bold text-fg ring-1 ring-line">{P.ini}</span>
              <div className="min-w-0">
                <p className="font-semibold text-fg">{P.nom}</p>
                <p className="text-sm text-fg-2">{P.ville}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> {P.email} · jamais affiché</p>
              </div>
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={ShieldCheck}>{etu ? 'Formation en cours' : 'Qualification'}</TitreTuile>
            <div className={`squircle-xl mt-4 flex flex-wrap items-start gap-3 p-4 ring-1 ring-inset ${P.verif ? 'bg-teal/5 ring-teal/25' : 'bg-amber-50 ring-amber-200'}`}>
              <span className={`squircle-lg grid size-9 shrink-0 place-items-center ${P.verif ? 'bg-teal/15 text-teal' : 'bg-amber-100 text-amber-700'}`}>
                {P.verif ? <BadgeCheck className="size-5" aria-hidden /> : <Upload className="size-4" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">{P.qualif}</p>
                <p className={`mt-0.5 text-sm ${P.verif ? 'text-teal' : 'text-amber-800'}`}>
                  {P.verif ? 'Certificat de scolarité vérifié automatiquement le 2 octobre' : 'Titre à ajouter pour afficher le badge « Titre vérifié »'}
                </p>
                <p className="mt-1 text-xs text-fg-2">Le document est vérifié automatiquement, puis supprimé après vérification. Seul le badge reste.</p>
              </div>
              {!P.verif && <BoutonPlein className="max-sm:w-full">Ajouter mon titre</BoutonPlein>}
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={Briefcase} droite={<span className="flex items-center gap-1 text-sm text-fg"><Plus className="size-4" aria-hidden /> Ajouter</span>}>
              {etu ? 'Parcours' : 'Expériences'}
            </TitreTuile>
            <ul className="mt-3 divide-y divide-line">
              {P.experiences.map(([t, o, d]) => (
                <li key={t + d} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">{t}</p>
                    <p className="text-sm text-fg-2">{o}</p>
                  </div>
                  <span className="text-xs text-fg-2">{d}</span>
                </li>
              ))}
            </ul>
          </Tuile>
          <Tuile>
            <TitreTuile i={Wrench}>Compétences</TitreTuile>
            <div className="mt-4 flex flex-wrap gap-2">
              {P.competences.map(([t, on]) => (
                <Puce key={t as string} on={on as boolean}>{t as string}</Puce>
              ))}
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={Navigation}>Ce que vous cherchez</TitreTuile>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-fg">Mobilité</span>
                  <span className="font-semibold tabular-nums text-fg">{P.rayon} autour de chez vous</span>
                </div>
                <span className="relative mt-3 block h-1.5 rounded-full bg-line">
                  <span className="absolute inset-y-0 left-0 w-[30%] rounded-full bg-teal" />
                  <span className="absolute left-[30%] top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal bg-bg" />
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-fg">Disponibilité</span>
                <span className="squircle-lg border border-line px-3 py-1.5 text-fg">{P.dispo}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-fg">Contrats recherchés</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {P.contrats.map(([t, on]) => (
                    <Puce key={t as string} on={on as boolean}>{t as string}</Puce>
                  ))}
                </div>
              </div>
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={FileText} droite={<span className="text-xs text-fg-2">Facultatif</span>}>CV</TitreTuile>
            {etu ? (
              <span className="squircle-xl mt-4 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-line p-6 text-center text-sm text-fg-2">
                <Upload className="size-5" aria-hidden /> Déposer un CV au format PDF, 2 Mo au plus
              </span>
            ) : (
              <div className="squircle-xl mt-4 flex items-center gap-3 border border-line p-3">
                <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-red-50 text-red-600">
                  <FileText className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">CV_Camille_Martin.pdf</p>
                  <p className="text-xs text-fg-2">PDF · 182 Ko · joint à vos candidatures</p>
                </div>
                <span className="text-sm font-medium text-fg underline underline-offset-2">Remplacer</span>
              </div>
            )}
          </Tuile>
        </div>
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Tuile>
            <TitreTuile i={Eye}>Ce que voient les recruteurs</TitreTuile>
            <div className="squircle-xl mt-4 border border-line p-4">
              <div className="flex items-center gap-3">
                <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-bg-soft text-xs font-bold text-fg ring-1 ring-line">{P.ini.split('').join('. ')}.</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">{P.vu.titre}</p>
                  <p className="text-xs text-fg-2">{P.vu.exp} · {P.vu.lieu}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {P.contrats.filter((c) => c[1]).map(([t]) => (
                  <span key={t as string} className="squircle-full bg-bg-soft px-2 py-0.5 text-[11px] text-fg">{t as string}</span>
                ))}
                <span className="squircle-full bg-bg-soft px-2 py-0.5 text-[11px] text-fg">{P.dispo}</span>
              </div>
              <span className="mt-4 flex h-9 items-center justify-center rounded-full border border-line text-xs font-medium text-fg">Proposer un échange</span>
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-fg-2">
              <li className="flex items-center gap-2"><EyeOff className="size-3.5" aria-hidden /> Ni nom, ni photo, ni adresse exacte</li>
              <li className="flex items-center gap-2"><EyeOff className="size-3.5" aria-hidden /> Distance arrondie, quartier seulement</li>
              <li className="flex items-center gap-2"><EyeOff className="size-3.5" aria-hidden /> Coordonnées après votre accord</li>
            </ul>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ==================================== Alertes ==================================== */
export function CandAlertes({ profil }: { profil: ProfilCand }) {
  const alertes = profil === 'etudiant'
    ? [
        { t: 'Alternance en laboratoire', c: ['Prothésiste dentaire', 'Alternance', '15 km autour de Bordeaux'], f: 'Chaque matin', canal: 'Courriel', on: true },
        { t: 'Stages d’été', c: ['Prothésiste dentaire', 'Stage', 'Gironde'], f: 'Chaque semaine', canal: 'Courriel', on: false },
      ]
    : [
        { t: 'Assistant(e) dentaire, CDI', c: ['Assistant(e) dentaire', 'CDI', 'Temps plein', '15 km autour de Bordeaux'], f: 'Chaque matin', canal: 'Courriel', on: true },
        { t: 'Orthodontie', c: ['Assistant(e) dentaire en orthodontie', 'CDI ou CDD', '25 km'], f: 'Chaque semaine', canal: 'Courriel', on: true },
        { t: 'Remplacements d’été', c: ['Assistant(e) dentaire', 'Remplacement', 'Bordeaux Métropole'], f: 'Dès qu’une offre paraît', canal: 'Notification', on: false },
      ]
  return (
    <Coque profil={profil} actif="alertes" titre="Alertes emploi" sousTitre={`${alertes.filter((a) => a.on).length} alertes actives · vous êtes prévenu dès qu’une offre correspond`} action={<BoutonPlein i={Plus}>Créer une alerte</BoutonPlein>}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="space-y-3">
          {alertes.map((a) => (
            <li key={a.t} className={`squircle-2xl border border-line bg-bg p-5 ${a.on ? '' : 'opacity-75'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-fg">{a.t}</p>
                  <p className="mt-0.5 text-xs text-fg-2">{a.on ? 'Active' : 'En pause'}</p>
                </div>
                <Interrupteur on={a.on} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.c.map((c) => (
                  <span key={c} className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">{c}</span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm text-fg-2">
                <span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden /> {a.f}</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="size-4" aria-hidden /> {a.canal}</span>
                <span className="ml-auto inline-flex items-center gap-1 font-medium text-fg"><Pencil className="size-3.5" aria-hidden /> Modifier</span>
              </div>
            </li>
          ))}
        </ul>
        <aside>
          <Tuile>
            <TitreTuile i={Search}>Comment ça marche</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Une alerte reprend vos critères de recherche. Les offres arrivent triées par distance, avec la rémunération affichée.</p>
            <p className="mt-3 text-sm text-fg-2">Vous pouvez mettre une alerte en pause sans la supprimer, par exemple pendant une période d’essai.</p>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* =================================== Visibilité =================================== */
export function CandVisibilite({ profil }: { profil: ProfilCand }) {
  const etu = profil === 'etudiant'
  const masquees = etu
    ? [['Laboratoire de prothèse fixe, Mérignac', 'Lieu de votre dernier stage']]
    : [['Cabinet d’omnipratique, Bordeaux', 'Votre employeur actuel'], ['Centre dentaire, Talence', 'Ancien employeur']]
  const journal = etu
    ? [['Prothèse Céramique Atlantique, Pessac', '11 oct.', 'En attente de votre réponse'], ['Laboratoire des Graves, Talence', '2 oct.', 'Acceptée']]
    : [
        ['Cabinet Sainte-Catherine, Bordeaux', '11 oct.', 'En attente de votre réponse'],
        ['Cabinet des Acacias, Pessac', '4 oct.', 'Déclinée'],
        ['Centre dentaire Bastide Nord, Bordeaux', '27 sept.', 'Acceptée'],
      ]
  return (
    <Coque profil={profil} actif="visibilite" titre="Visibilité" sousTitre={`Qui peut vous trouver et vous proposer un échange`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { i: Eye, t: `Visible par les ${etu ? 'laboratoires' : 'cabinets et laboratoires'} vérifiés`, d: 'Votre profil apparaît anonymisé dans « Profils disponibles près de vous ». Les recruteurs peuvent vous proposer un échange ; vous acceptez ou non.', on: true },
              { i: EyeOff, t: 'Discret, je postule moi-même', d: 'Personne ne voit votre profil tant que vous n’avez pas postulé. Vos alertes continuent de fonctionner.', on: false },
            ].map((m) => (
              <div key={m.t} className={`squircle-2xl border bg-bg p-5 ${m.on ? 'border-fg ring-1 ring-fg' : 'border-line'}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className={`squircle-lg grid size-9 place-items-center ${m.on ? 'bg-teal/15 text-teal' : 'bg-bg-soft text-fg-2'}`}>
                    <m.i className="size-4" aria-hidden />
                  </span>
                  <span className={`grid size-5 place-items-center rounded-full border-2 ${m.on ? 'border-fg' : 'border-line'}`}>
                    {m.on && <span className="size-2.5 rounded-full bg-fg" />}
                  </span>
                </div>
                <p className="mt-3 font-semibold text-fg">{m.t}</p>
                <p className="mt-1 text-sm text-fg-2">{m.d}</p>
              </div>
            ))}
          </div>
          <Tuile>
            <TitreTuile i={EyeOff} droite={<span className="flex items-center gap-1 text-sm text-fg"><Plus className="size-4" aria-hidden /> Masquer</span>}>
              Structures qui ne vous voient pas
            </TitreTuile>
            <ul className="mt-3 divide-y divide-line">
              {masquees.map(([t, d]) => (
                <li key={t} className="flex items-center gap-3 py-3">
                  <span className="squircle-lg grid size-9 shrink-0 place-items-center bg-bg-soft text-fg-2 ring-1 ring-line">
                    <Building2 className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{t}</p>
                    <p className="text-xs text-fg-2">{d}</p>
                  </div>
                  <span className="shrink-0 text-sm text-fg-2">Retirer</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-fg-2">Ces structures ne voient ni votre profil, ni vos candidatures passées chez d’autres.</p>
          </Tuile>
          <Tuile>
            <TitreTuile i={MessageSquare}>Échanges proposés</TitreTuile>
            <ul className="mt-3 divide-y divide-line">
              {journal.map(([t, d, s]) => (
                <li key={t} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">{t}</p>
                    <p className="text-xs text-fg-2">Proposé le {d}</p>
                  </div>
                  <span
                    className={`squircle-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                      s.startsWith('En attente') ? 'bg-amber-50 text-amber-700 ring-amber-200' : s === 'Acceptée' ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg-soft text-fg-2 ring-line'
                    }`}
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </Tuile>
        </div>
        <aside>
          <Tuile>
            <TitreTuile i={ShieldCheck}>Ce qui reste privé</TitreTuile>
            <ul className="mt-4 space-y-2.5 text-sm text-fg-2">
              {['Votre nom et votre photo', 'Votre adresse, seul le quartier apparaît', 'Votre téléphone et votre courriel, jusqu’à votre accord', 'Votre employeur actuel'].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ================================= Ma formation (étudiant) ================================= */
export function EtuFormation() {
  // Six mois de semaines : É = école, E = entreprise, V = vacances.
  const mois: [string, string[]][] = [
    ['Sept.', ['É', 'É', 'E', 'E']],
    ['Oct.', ['É', 'É', 'E', 'E', 'V']],
    ['Nov.', ['É', 'É', 'E', 'E']],
    ['Déc.', ['É', 'É', 'E', 'V']],
    ['Janv.', ['É', 'É', 'E', 'E']],
    ['Févr.', ['É', 'É', 'V', 'E']],
  ]
  const couleur = { É: 'bg-fg text-bg', E: 'bg-teal/15 text-teal ring-1 ring-inset ring-teal/30', V: 'bg-bg-soft text-fg-2 ring-1 ring-inset ring-line' } as Record<string, string>
  return (
    <Coque profil="etudiant" actif="formation" titre="Ma formation" sousTitre="Votre école et votre rythme, pour recevoir des offres qui s’y accordent">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile>
            <div className="flex flex-wrap items-center gap-4">
              <span className="squircle-xl grid size-14 shrink-0 place-items-center bg-white text-xs font-bold text-[#0e1317] ring-1 ring-line">EPB</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-fg-2">École</p>
                <p className="font-semibold text-fg">École de prothèse dentaire de Bordeaux</p>
                <p className="text-sm text-fg-2">Privé sous contrat · Bordeaux</p>
              </div>
              <BoutonDiscret i={ExternalLink} className="max-sm:w-full">Voir la page de l’école</BoutonDiscret>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                ['Formation', 'BTS Prothésiste dentaire'],
                ['Année', '1re année, 2026 à 2027'],
                ['Diplôme prévu', 'Juin 2028'],
              ].map(([l, v]) => (
                <div key={l} className="squircle-xl bg-bg-soft p-3">
                  <dt className="text-xs text-fg-2">{l}</dt>
                  <dd className="mt-1 text-sm font-medium text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </Tuile>
          <Tuile>
            <TitreTuile i={CalendarDays} droite={<span className="squircle-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">À confirmer</span>}>
              Rythme d’alternance
            </TitreTuile>
            <p className="mt-3 text-sm text-fg">
              2 semaines à l’école, 2 semaines en entreprise
              <span className="block text-xs text-fg-2">Proposé d’après le calendrier publié par l’école. Confirmez-le ou ajustez-le.</span>
            </p>
            <div className="mt-4 space-y-1.5">
              {mois.map(([m, s]) => (
                <div key={m} className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-xs text-fg-2">{m}</span>
                  <div className="grid flex-1 grid-cols-5 gap-1">
                    {s.map((x, i) => (
                      <span key={i} className={`squircle-lg grid h-7 place-items-center text-[11px] font-semibold ${couleur[x]}`}>{x === 'É' ? 'École' : x === 'E' ? 'Entr.' : 'Vac.'}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-2">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-fg" /> À l’école</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-teal/40" /> En entreprise</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-line" /> Vacances</span>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <BoutonPlein i={Check}>Confirmer ce rythme</BoutonPlein>
              <BoutonDiscret>Ajuster</BoutonDiscret>
            </div>
          </Tuile>
        </div>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={ShieldCheck}>Certificat de scolarité</TitreTuile>
            <div className="squircle-xl mt-4 flex items-start gap-3 bg-teal/5 p-3 ring-1 ring-inset ring-teal/25">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-fg">Vérifié automatiquement</p>
                <p className="text-xs text-fg-2">Le 2 octobre 2026 · année 2026 à 2027</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-fg-2">Le document a été supprimé après vérification. Seul le badge « Étudiant vérifié » reste sur votre profil. À renouveler à la rentrée 2027.</p>
          </Tuile>
          <Tuile>
            <TitreTuile i={Info}>Pourquoi le rythme compte</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Les laboratoires indiquent le rythme qu’ils acceptent. Nous ne vous proposons que les offres compatibles avec le vôtre.</p>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

export const SalVue = () => <CandVue profil="salarie" />
export const EtuVue = () => <CandVue profil="etudiant" />
export const SalOffres = () => <CandOffres profil="salarie" />
export const EtuOffres = () => <CandOffres profil="etudiant" />
export const SalOffre = () => <CandOffre profil="salarie" />
export const EtuOffre = () => <CandOffre profil="etudiant" />
export const SalCandidatures = () => <CandCandidatures profil="salarie" />
export const EtuCandidatures = () => <CandCandidatures profil="etudiant" />
export const SalProfil = () => <CandProfil profil="salarie" />
export const EtuProfil = () => <CandProfil profil="etudiant" />
export const SalAlertes = () => <CandAlertes profil="salarie" />
export const SalVisibilite = () => <CandVisibilite profil="salarie" />
