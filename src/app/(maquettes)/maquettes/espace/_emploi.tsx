/** MAQUETTE. Rubrique Emploi des pros (dentiste et laboratoire) : offres, profils disponibles, candidatures. Données d'exemple. */
import {
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Euro,
  FileText,
  Info,
  MapPin,
  MessageSquare,
  Plus,
  Route,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Coque, Tuile, TitreTuile } from './_coque'

type ProfilEmploi = 'dentiste' | 'labo'
type StatutOffre = 'ligne' | 'brouillon' | 'pourvue'

type Offre = {
  poste: string; contrat: string; temps: string; lieu: string; remu: string
  statut: StatutOffre; cand?: number; nouvelles?: number; duree: string
}

type ProfilDispo = { ini: string; qualif: string; km: string; dispo: string; contrat: string; verifie: boolean }

export type Candidature = {
  ini: string; nom: string; qualif: string; quand: string
  statut: 'nouvelle' | 'vue' | 'echange' | 'retenue' | 'non'
  verifie: boolean; exp: string; dispo: string; mobilite: string; message: string; cv?: string
}

const DONNEES: Record<ProfilEmploi, {
  structure: string; sousTitre: string; offres: Offre[]; dispo: ProfilDispo[]; candidatures: Candidature[]
}> = {
  dentiste: {
    structure: 'cabinet',
    sousTitre: '1 offre en ligne · 3 nouvelles candidatures',
    offres: [
      { poste: 'Assistant(e) dentaire qualifié(e)', contrat: 'CDI', temps: 'Temps plein', lieu: '12 Rue Sainte-Catherine, Bordeaux', remu: '2 100 à 2 400 € brut par mois', statut: 'ligne', cand: 8, nouvelles: 3, duree: 'En ligne depuis 6 jours · expire dans 24 jours' },
      { poste: 'Remplacement été, juillet et août', contrat: 'Remplacement', temps: 'Temps plein', lieu: '41 Avenue de la Marne, Mérignac', remu: '2 000 à 2 200 € brut par mois', statut: 'brouillon', duree: 'Brouillon enregistré le 8 octobre' },
      { poste: 'Assistant(e) dentaire en alternance', contrat: 'Alternance', temps: 'Rythme école', lieu: '12 Rue Sainte-Catherine, Bordeaux', remu: '1 000 à 1 250 € brut par mois', statut: 'pourvue', cand: 14, duree: 'Pourvue le 2 septembre · candidatures supprimées le 2 mars 2027' },
    ],
    dispo: [
      { ini: 'S. L.', qualif: 'Assistante dentaire qualifiée', km: '1,8 km', dispo: 'Disponible dès maintenant', contrat: 'CDI, temps plein', verifie: true },
      { ini: 'N. B.', qualif: 'Assistant dentaire qualifié', km: '3,2 km', dispo: 'Disponible en janvier', contrat: 'CDI ou CDD', verifie: true },
      { ini: 'A. G.', qualif: 'Secrétaire assistante dentaire', km: '5,6 km', dispo: 'Préavis d’un mois', contrat: 'CDI, temps partiel', verifie: false },
      { ini: 'M. T.', qualif: 'Assistante dentaire, en formation', km: '8,9 km', dispo: 'Alternance, rentrée 2027', contrat: 'Alternance', verifie: false },
    ],
    candidatures: [
      { ini: 'JR', nom: 'Julie R.', qualif: 'Assistante dentaire qualifiée', quand: 'Aujourd’hui', statut: 'nouvelle', verifie: true, exp: '6 ans en omnipratique, dont 2 en implantologie', dispo: 'Préavis d’un mois, libre au 15 novembre', mobilite: 'Bordeaux et 15 km autour, en tram', message: 'Bonjour, je travaille depuis six ans en cabinet d’omnipratique et j’assiste en chirurgie implantaire deux jours par semaine. Je cherche un cabinet en centre-ville, avec une équipe stable, où je pourrai aussi participer à l’accueil. Je suis disponible pour un échange en fin de journée.', cv: 'CV_assistante_dentaire.pdf · 182 Ko' },
      { ini: 'KD', nom: 'Karim D.', qualif: 'Assistant dentaire qualifié', quand: 'Aujourd’hui', statut: 'nouvelle', verifie: true, exp: '3 ans en centre dentaire', dispo: 'Disponible dès maintenant', mobilite: '10 km', message: 'Je souhaite rejoindre un cabinet à taille humaine.' },
      { ini: 'EM', nom: 'Emma M.', qualif: 'Assistante dentaire qualifiée', quand: 'Hier', statut: 'nouvelle', verifie: false, exp: '2 ans', dispo: 'Janvier', mobilite: '20 km', message: '' },
      { ini: 'CM', nom: 'Camille M.', qualif: 'Assistante dentaire qualifiée', quand: '9 oct.', statut: 'echange', verifie: false, exp: '9 ans', dispo: 'Préavis d’un mois', mobilite: '15 km', message: '' },
      { ini: 'TF', nom: 'Thomas F.', qualif: 'Secrétaire assistant dentaire', quand: '8 oct.', statut: 'vue', verifie: true, exp: '4 ans', dispo: 'Disponible', mobilite: '5 km', message: '' },
      { ini: 'IH', nom: 'Inès H.', qualif: 'Assistante dentaire qualifiée', quand: '7 oct.', statut: 'retenue', verifie: true, exp: '5 ans', dispo: 'Décembre', mobilite: '15 km', message: '' },
      { ini: 'RB', nom: 'Romain B.', qualif: 'Aide dentaire', quand: '6 oct.', statut: 'non', verifie: false, exp: '1 an', dispo: 'Disponible', mobilite: '30 km', message: '' },
      { ini: 'CV', nom: 'Chloé V.', qualif: 'Assistante dentaire qualifiée', quand: '5 oct.', statut: 'vue', verifie: true, exp: '7 ans', dispo: 'Mars 2027', mobilite: '10 km', message: '' },
    ],
  },
  labo: {
    structure: 'laboratoire',
    sousTitre: '1 offre en ligne · 3 nouvelles candidatures',
    offres: [
      { poste: 'Prothésiste céramiste', contrat: 'CDI', temps: 'Temps plein', lieu: '8 Avenue de la Somme, Mérignac', remu: '2 300 à 2 800 € brut par mois', statut: 'ligne', cand: 5, nouvelles: 3, duree: 'En ligne depuis 6 jours · expire dans 24 jours' },
      { poste: 'Apprenti(e) BTS prothésiste dentaire', contrat: 'Alternance', temps: 'Rythme école', lieu: '8 Avenue de la Somme, Mérignac', remu: '780 à 1 000 € brut par mois', statut: 'brouillon', duree: 'Brouillon enregistré le 5 octobre' },
      { poste: 'Prothésiste CFAO', contrat: 'CDD 6 mois', temps: 'Temps plein', lieu: '8 Avenue de la Somme, Mérignac', remu: '2 200 à 2 500 € brut par mois', statut: 'pourvue', cand: 7, duree: 'Pourvue le 20 août · candidatures supprimées le 20 février 2027' },
    ],
    dispo: [
      { ini: 'P. A.', qualif: 'Prothésiste dentaire, BTMS', km: '2,4 km', dispo: 'Disponible dès maintenant', contrat: 'CDI, temps plein', verifie: true },
      { ini: 'O. R.', qualif: 'Prothésiste céramiste', km: '6,1 km', dispo: 'Préavis d’un mois', contrat: 'CDI', verifie: true },
      { ini: 'H. D.', qualif: 'Prothésiste CFAO', km: '9,7 km', dispo: 'Disponible en décembre', contrat: 'CDI ou CDD', verifie: false },
      { ini: 'Y. M.', qualif: 'Étudiant en BTS prothésiste dentaire', km: '12,3 km', dispo: 'Alternance, rentrée 2027', contrat: 'Alternance', verifie: false },
    ],
    candidatures: [
      { ini: 'MC', nom: 'Marion C.', qualif: 'Prothésiste dentaire, BTMS céramique', quand: 'Aujourd’hui', statut: 'nouvelle', verifie: true, exp: '8 ans en laboratoire, céramique stratifiée et zircone', dispo: 'Préavis d’un mois, libre au 15 novembre', mobilite: 'Mérignac et 20 km autour, en voiture', message: 'Bonjour, céramiste depuis huit ans, je monte surtout des stratifications sur zircone et des facettes. Je cherche un laboratoire qui travaille en numérique avec les cabinets. Je peux venir faire une journée d’essai.', cv: 'CV_prothesiste_ceramiste.pdf · 214 Ko' },
      { ini: 'AL', nom: 'Antoine L.', qualif: 'Prothésiste dentaire, BTS', quand: 'Aujourd’hui', statut: 'nouvelle', verifie: true, exp: '4 ans', dispo: 'Disponible', mobilite: '15 km', message: '' },
      { ini: 'SN', nom: 'Sarah N.', qualif: 'Prothésiste dentaire', quand: 'Hier', statut: 'nouvelle', verifie: false, exp: '2 ans', dispo: 'Janvier', mobilite: '25 km', message: '' },
      { ini: 'BG', nom: 'Bastien G.', qualif: 'Prothésiste céramiste', quand: '8 oct.', statut: 'echange', verifie: true, exp: '11 ans', dispo: 'Préavis de deux mois', mobilite: '30 km', message: '' },
      { ini: 'FK', nom: 'Fatou K.', qualif: 'Prothésiste dentaire, BTMS', quand: '6 oct.', statut: 'vue', verifie: true, exp: '6 ans', dispo: 'Décembre', mobilite: '10 km', message: '' },
    ],
  },
}

export const STATUT_CAND = {
  nouvelle: ['Nouvelle', 'bg-teal/10 text-teal ring-teal/30'],
  vue: ['Vue', 'bg-bg-soft text-fg-2 ring-line'],
  echange: ['Échange proposé', 'bg-amber-50 text-amber-700 ring-amber-200'],
  retenue: ['Retenue', 'bg-fg text-bg ring-fg'],
  non: ['Non retenue', 'bg-bg text-fg-2 ring-line'],
} as const

function BadgeOffre({ s }: { s: StatutOffre }) {
  const m = {
    ligne: ['En ligne', 'bg-teal/10 text-teal ring-teal/25'],
    brouillon: ['Brouillon', 'bg-amber-50 text-amber-700 ring-amber-200'],
    pourvue: ['Pourvue', 'bg-bg-soft text-fg-2 ring-line'],
  }[s]
  return (
    <span className={`squircle-full inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${m[1]}`}>
      {s === 'ligne' && <span className="size-1.5 rounded-full bg-teal" />} {m[0]}
    </span>
  )
}

export function BoutonPlein({ i: I, children, className = '' }: { i?: typeof Plus; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground ${className}`}>
      {I && <I className="size-4" aria-hidden />} {children}
    </span>
  )
}

export function BoutonDiscret({ i: I, children, className = '' }: { i?: typeof Plus; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium text-fg ${className}`}>
      {I && <I className="size-4" aria-hidden />} {children}
    </span>
  )
}

export function TitreVerifie({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="squircle-full inline-flex items-center gap-1 bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal ring-1 ring-inset ring-teal/30">
      <BadgeCheck className="size-3.5" aria-hidden /> Titre vérifié
    </span>
  ) : (
    <span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-[11px] font-medium text-fg-2 ring-1 ring-inset ring-line">
      Titre non vérifié
    </span>
  )
}

/* ================================ Emploi (liste des offres) ================================ */
export function ProEmploi({ profil }: { profil: ProfilEmploi }) {
  const D = DONNEES[profil]
  return (
    <Coque profil={profil} actif="emploi" titre="Emploi" sousTitre={D.sousTitre} action={<BoutonPlein i={Plus}>Publier une offre</BoutonPlein>}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile className="!p-0">
            <div className="flex items-center justify-between gap-3 p-5 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Briefcase className="size-4 text-fg-2" aria-hidden /> Vos offres
              </h2>
              <span className="squircle-full flex bg-bg-soft p-0.5 text-xs">
                <span className="squircle-full bg-fg px-2.5 py-1 text-bg">Toutes</span>
                <span className="px-2.5 py-1 text-fg-2">En ligne</span>
                <span className="hidden px-2.5 py-1 text-fg-2 sm:inline">Archivées</span>
              </span>
            </div>
            <ul className="divide-y divide-line border-t border-line">
              {D.offres.map((o) => (
                <li key={o.poste} className={`flex flex-col gap-4 p-5 md:flex-row md:items-center ${o.statut === 'pourvue' ? 'opacity-75' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <BadgeOffre s={o.statut} />
                      <span className="text-xs text-fg-2">{o.duree}</span>
                    </div>
                    <p className="mt-2 font-semibold text-fg">{o.poste}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2">
                      <span>{o.contrat}</span>
                      <span>{o.temps}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden /> {o.lieu}</span>
                    </p>
                    <p className="mt-1 text-sm text-fg-2">{o.remu}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
                    {o.cand !== undefined ? (
                      <p className="text-sm text-fg">
                        <span className="font-semibold tabular-nums">{o.cand}</span> candidatures
                        {o.nouvelles ? <span className="squircle-full ml-2 bg-teal/15 px-1.5 text-[11px] font-semibold text-teal">{o.nouvelles} nouvelles</span> : null}
                      </p>
                    ) : (
                      <p className="text-sm text-fg-2">Pas encore publiée</p>
                    )}
                    {o.statut === 'ligne' && <BoutonPlein>Voir les candidatures</BoutonPlein>}
                    {o.statut === 'brouillon' && <BoutonDiscret>Reprendre le brouillon</BoutonDiscret>}
                    {o.statut === 'pourvue' && <BoutonDiscret>Republier</BoutonDiscret>}
                  </div>
                </li>
              ))}
            </ul>
          </Tuile>

          <Tuile>
            <TitreTuile i={Users} droite={<span className="text-xs text-fg-2">Les plus proches d’abord</span>}>
              Profils disponibles près de vous
            </TitreTuile>
            <ul className="mt-4 divide-y divide-line">
              {D.dispo.map((p) => (
                <li key={p.ini} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5">
                  <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-bg-soft text-xs font-bold text-fg ring-1 ring-line">{p.ini}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                      {p.qualif} <TitreVerifie ok={p.verifie} />
                    </p>
                    <p className="mt-0.5 text-sm text-fg-2">
                      À {p.km} · {p.dispo} · {p.contrat}
                    </p>
                  </div>
                  <BoutonDiscret i={MessageSquare} className="max-sm:w-full">Proposer un échange</BoutonDiscret>
                </li>
              ))}
            </ul>
            <p className="squircle-xl mt-3 flex items-start gap-2 bg-bg-soft p-3 text-xs leading-relaxed text-fg-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              Seules les personnes qui ont choisi d’être visibles apparaissent. Leurs coordonnées ne vous sont transmises que si elles acceptent l’échange.
            </p>
          </Tuile>
        </div>

        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={ScrollText}>Règles des offres</TitreTuile>
            <ul className="mt-4 space-y-4 text-sm">
              {[
                [CalendarClock, 'Publiée 30 jours', 'Renouvelable en un clic. Sans renouvellement, l’offre est retirée d’elle-même.'],
                [Euro, 'Rémunération affichée', 'Obligatoire : une fourchette brute mensuelle. Les offres sans salaire ne sont pas publiées.'],
                [Clock, 'Candidatures conservées 6 mois', 'Elles sont supprimées 6 mois après la clôture de l’offre, CV compris.'],
              ].map(([I, t, d]) => {
                const Icone = I as typeof Clock
                return (
                  <li key={t as string} className="flex gap-3">
                    <span className="squircle-lg grid size-8 shrink-0 place-items-center bg-bg-soft text-fg-2 ring-1 ring-line">
                      <Icone className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-fg">{t as string}</p>
                      <p className="mt-0.5 text-xs text-fg-2">{d as string}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Tuile>
          <Tuile>
            <TitreTuile i={Route}>Où votre offre apparaît</TitreTuile>
            <ul className="mt-4 space-y-2 text-sm text-fg-2">
              {[
                `Sur votre fiche, dans un encadré « Le ${D.structure} recrute »`,
                'Dans la recherche d’emploi DentalMap, triée par distance',
                'Dans les alertes des candidats de votre zone',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ============================ Candidatures d'une offre ============================ */
export function ProCandidatures({ profil }: { profil: ProfilEmploi }) {
  const D = DONNEES[profil]
  const offre = D.offres[0]
  const c = D.candidatures[0]
  return (
    <Coque
      profil={profil}
      actif="emploi"
      titre={offre.poste}
      sousTitre={`${offre.contrat} · ${offre.temps} · ${offre.cand} candidatures dont ${offre.nouvelles} nouvelles`}
      action={<BoutonDiscret i={Check}>Marquer comme pourvue</BoutonDiscret>}
    >
      <p className="-mt-2 mb-4 flex min-w-0 items-center gap-1 text-sm text-fg-2">
        <ChevronLeft className="size-4" aria-hidden /> <span className="font-medium text-fg">Emploi</span>
        <ChevronRight className="size-3.5" aria-hidden /> <span className="min-w-0 truncate">{offre.poste}</span>
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
        <Tuile className="!p-0">
          <div className="flex flex-wrap gap-1.5 p-4">
            {['Toutes', 'Nouvelles', 'Échange proposé', 'Retenues'].map((f, i) => (
              <span key={f} className={`squircle-full px-2.5 py-1 text-xs ${i === 0 ? 'bg-fg text-bg' : 'border border-line text-fg-2'}`}>
                {f}
              </span>
            ))}
          </div>
          <ul className="divide-y divide-line border-t border-line">
            {D.candidatures.map((k, i) => {
              const s = STATUT_CAND[k.statut]
              return (
                <li key={k.ini} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? 'bg-bg-soft' : ''} ${k.statut === 'non' ? 'opacity-60' : ''}`}>
                  <span className={`squircle-lg grid size-9 shrink-0 place-items-center text-xs font-bold ring-1 ${i === 0 ? 'bg-bg text-fg ring-fg' : 'bg-bg text-fg ring-line'}`}>{k.ini}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm text-fg ${k.statut === 'nouvelle' ? 'font-semibold' : 'font-medium'}`}>{k.nom}</p>
                    <p className="truncate text-xs text-fg-2">{k.qualif}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`squircle-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${s[1]}`}>{s[0]}</span>
                    <span className="text-[11px] text-fg-2">{k.quand}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </Tuile>

        <Tuile className="!p-0">
          <div className="flex flex-wrap items-start gap-4 border-b border-line p-5 sm:p-6">
            <span className="squircle-xl grid size-14 shrink-0 place-items-center bg-bg-soft text-base font-bold text-fg ring-1 ring-line">{c.ini}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-fg-2">Candidature reçue aujourd’hui à 9h42</p>
              <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-fg">{c.nom}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg">
                {c.qualif} <TitreVerifie ok={c.verifie} />
              </p>
            </div>
            <span className={`squircle-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUT_CAND[c.statut][1]}`}>{STATUT_CAND[c.statut][0]}</span>
          </div>
          <div className="space-y-6 p-5 sm:p-6">
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                [Briefcase, 'Expérience', c.exp],
                [CalendarClock, 'Disponibilité', c.dispo],
                [MapPin, 'Mobilité', c.mobilite],
              ].map(([I, l, v]) => {
                const Icone = I as typeof Clock
                return (
                  <div key={l as string} className="squircle-xl bg-bg-soft p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-fg-2"><Icone className="size-3.5" aria-hidden /> {l as string}</dt>
                    <dd className="mt-1 text-sm text-fg">{v as string}</dd>
                  </div>
                )
              })}
            </dl>
            <div>
              <p className="text-sm font-semibold text-fg">Message de motivation</p>
              <p className="mt-2 text-sm leading-relaxed text-fg">{c.message}</p>
            </div>
            {c.cv && (
              <div className="squircle-xl flex items-center gap-3 border border-line p-3">
                <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-red-50 text-red-600">
                  <FileText className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{c.cv.split(' · ')[0]}</p>
                  <p className="text-xs text-fg-2">PDF · {c.cv.split(' · ')[1]}</p>
                </div>
                <span className="text-sm font-medium text-fg underline underline-offset-2">Ouvrir</span>
              </div>
            )}
            <p className="squircle-xl flex items-start gap-2 bg-bg-soft p-3 text-xs leading-relaxed text-fg-2">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Ses coordonnées vous sont transmises si elle accepte votre proposition d’échange. Les candidatures sont supprimées 6 mois après la clôture de l’offre.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-line p-5 sm:flex-row sm:justify-end">
            <BoutonDiscret>Non retenue</BoutonDiscret>
            <BoutonPlein i={MessageSquare}>Proposer un échange</BoutonPlein>
          </div>
        </Tuile>
      </div>
    </Coque>
  )
}

export const EmploiDentiste = () => <ProEmploi profil="dentiste" />
export const EmploiLabo = () => <ProEmploi profil="labo" />
export const CandidaturesDentiste = () => <ProCandidatures profil="dentiste" />
export const CandidaturesLabo = () => <ProCandidatures profil="labo" />
