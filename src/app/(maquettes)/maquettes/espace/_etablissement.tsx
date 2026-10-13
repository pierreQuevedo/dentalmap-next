/** MAQUETTE. Tableau de bord d'un établissement de formation : quatre écrans. Données d'exemple. */
import Image from 'next/image'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock,
  Copyright,
  Eye,
  GraduationCap,
  GripVertical,
  ImagePlus,
  Images,
  ListChecks,
  Lock,
  PanelsTopLeft,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Upload,
  X,
} from 'lucide-react'
import { Coque, Statut, Tuile, TitreTuile } from './_coque'

const SECTIONS = [
  { n: 'Héros', d: 'Nom, statut, logo, portes ouvertes, candidatures', s: 'incomplete', manque: 'Logo manquant', src: 'Déclaré et registre' },
  { n: 'Présentation', d: 'Accroche et texte de présentation', s: 'publiee', src: 'Déclaré' },
  { n: 'Galerie', d: '12 photos, crédit photo renseigné', s: 'publiee', src: 'Déclaré' },
  { n: 'Formations proposées', d: '3 diplômes', s: 'incomplete', manque: 'Places du BTMS', src: 'Déclaré et RNCP' },
  { n: 'Admission', d: 'Étapes de sélection et ce que l’école attend', s: 'vide', src: 'Déclaré' },
  { n: 'Alternance', d: 'Rythme, aide, 38 laboratoires partenaires', s: 'publiee', src: 'Déclaré' },
  { n: 'Réussite et insertion', d: 'Session 2025, InserJeunes 2024', s: 'auto', src: 'Ministère de l’Éducation nationale' },
  { n: 'Plateau technique et vie étudiante', d: 'Ateliers, internat, transports', s: 'incomplete', manque: 'Référent handicap', src: 'Déclaré' },
  { n: 'Coûts et aides', d: 'Frais, équipement, aides', s: 'vide', src: 'Déclaré' },
  { n: 'Portes ouvertes et rendez-vous', d: '3 événements à venir', s: 'publiee', src: 'Déclaré' },
  { n: 'Accès et contacts', d: '3 contacts, site web', s: 'publiee', src: 'Déclaré' },
  { n: 'Registres', d: 'UAI, SIRET, Qualiopi, RNCP', s: 'auto', src: 'Référentiels publics' },
] as const

const MISSIONS = [
  { t: 'Ajouter le logo', d: '1 min', gain: '+4 %', reco: true },
  { t: 'Décrire l’admission', d: '5 min', gain: '+8 %' },
  { t: 'Renseigner les coûts et aides', d: '3 min', gain: '+6 %' },
  { t: 'Calendrier de candidature 2027', d: '2 min', gain: '+4 %' },
]

/* ============================== Vue d'ensemble ============================== */
export function EtabVue() {
  return (
    <Coque actif="vue" titre="Vue d’ensemble" sousTitre="Lundi 12 octobre · page publiée depuis le 3 septembre">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="dark squircle-2xl relative overflow-hidden bg-background p-8 text-fg">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-md">
              <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/15 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
                <CheckCircle2 className="size-3.5" aria-hidden /> Page en ligne
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Bonjour, École de prothèse dentaire de Bordeaux</h2>
              <p className="mt-3 text-white/70">7 sections sur 10 sont publiées. Décrire l’admission rendrait la page complète pour les candidats de Parcoursup, qui arrivent en janvier.</p>
            </div>
            <div className="relative grid size-40 place-items-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" className="text-white/10" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${0.7 * 276.5} 276.5`} className="text-teal" />
              </svg>
              <div className="text-center">
                <p className="text-4xl font-semibold tracking-tight text-white">70 %</p>
                <p className="text-xs text-white/60">page complète</p>
              </div>
            </div>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              ['7 sur 10', 'sections déclarées publiées'],
              ['2', 'sections automatiques à jour'],
              ['6 févr.', 'prochaines portes ouvertes'],
              ['1 240', 'visites ce mois-ci'],
            ].map(([v, l]) => (
              <div key={l} className="border-l border-white/10 pl-4 first:border-0 first:pl-0">
                <dt className="text-2xl font-semibold text-white">{v}</dt>
                <dd className="mt-1 text-xs text-white/60">{l}</dd>
              </div>
            ))}
          </dl>
          <div className="squircle-xl mt-10 flex flex-wrap items-center gap-4 bg-white/5 p-4 ring-1 ring-white/10">
            <span className="squircle-lg grid size-10 place-items-center bg-amber-100 text-amber-700">
              <ListChecks className="size-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">Prochaine action · +8 % · 5 min</p>
              <p className="font-semibold text-white">Décrire l’admission</p>
            </div>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
              Commencer <ArrowRight className="size-4" aria-hidden />
            </span>
          </div>
        </section>

        <Tuile>
          <TitreTuile i={Eye} droite={<span className="squircle-full flex bg-bg-soft p-0.5 text-xs"><span className="squircle-full bg-fg px-2.5 py-1 text-bg">Candidats</span><span className="px-2.5 py-1 text-fg-2">Google</span></span>}>
            Aperçu public
          </TitreTuile>
          <div className="squircle-xl dark mt-4 overflow-hidden border border-line bg-background">
            <div className="relative aspect-[4/3]">
              <Image src="/images/demo/pexels-6627325.jpg" alt="" fill sizes="22rem" className="object-cover opacity-80" />
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center gap-3">
                <span className="squircle-lg grid size-10 place-items-center border border-dashed border-white/40 text-[10px] text-white/60">Logo</span>
                <p className="text-sm font-semibold leading-tight text-white">École de prothèse dentaire de Bordeaux</p>
              </div>
              <p className="text-xs text-white/60">Portes ouvertes le 6 février 2027</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-fg-2">Mis à jour en direct à chaque modification.</p>
        </Tuile>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Tuile>
          <TitreTuile i={Sparkles} droite={<span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">0 sur 4</span>}>
            Missions
          </TitreTuile>
          <ul className="mt-4 space-y-1">
            {MISSIONS.map((m) => (
              <li key={m.t} className={`squircle-xl flex items-center gap-3 p-3 ${'reco' in m ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}>
                <CircleDashed className="size-5 text-fg-2" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-medium text-fg">{m.t}</p>
                  <p className={`text-xs ${'reco' in m ? 'text-amber-700' : 'text-fg-2'}`}>{'reco' in m ? 'Recommandée · ' : ''}{m.d}</p>
                </div>
                <span className="squircle-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">{m.gain}</span>
                <ChevronRight className="size-4 text-fg-2" aria-hidden />
              </li>
            ))}
          </ul>
        </Tuile>
        <Tuile>
          <TitreTuile i={PanelsTopLeft} droite={<span className="text-xs text-fg-2">12 sections</span>}>
            Sections de la page
          </TitreTuile>
          <ul className="mt-4 space-y-2.5">
            {SECTIONS.slice(0, 8).map((s) => (
              <li key={s.n} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-fg">{s.n}</span>
                <Statut s={s.s} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-2">Une section vide n’apparaît pas sur la page publique.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={RefreshCw}>Fraîcheur des informations</TitreTuile>
          <ul className="mt-4 space-y-4 text-sm">
            {[
              ['Portes ouvertes', 'Dans 117 jours', 0.2],
              ['Calendrier de candidature', 'À renseigner pour 2027', 1],
              ['Formations', 'Valable 11 mois', 0.08],
              ['Résultats aux examens', 'Session 2025, automatique', 0.3],
            ].map(([k, v, p]) => (
              <li key={k as string}>
                <div className="flex justify-between gap-3">
                  <span className="text-fg">{k}</span>
                  <span className={p === 1 ? 'text-amber-700' : 'text-fg-2'}>{v}</span>
                </div>
                <span className="mt-2 block h-1 rounded-full bg-line">
                  <span className={`block h-full rounded-full ${p === 1 ? 'bg-amber-400' : 'bg-teal'}`} style={{ width: `${(p as number) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </Tuile>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Clock} droite={<span className="text-sm text-fg">Tout voir</span>}>
            Activité récente
          </TitreTuile>
          <ul className="mt-2 divide-y divide-line text-sm">
            {[
              ['Galerie : 4 photos ajoutées par Claire Martin', 'Hier'],
              ['Résultats de la session 2025 publiés automatiquement', '9 oct.'],
              ['Portes ouvertes du 6 février ajoutées', '2 oct.'],
              ['Référentiel UAI synchronisé, aucun changement', '28 sept.'],
            ].map(([t, d]) => (
              <li key={t} className="flex justify-between gap-4 py-3">
                <span className="text-fg">{t}</span>
                <span className="shrink-0 text-fg-2">{d}</span>
              </li>
            ))}
          </ul>
        </Tuile>
        <Tuile>
          <TitreTuile i={BadgeCheck} droite={<span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> Privées</span>}>
            Distinctions
          </TitreTuile>
          <ul className="mt-5 grid grid-cols-4 gap-3 text-center text-xs">
            {[
              ['Établissement vérifié', true],
              ['Calendrier à jour', true],
              ['Galerie complète', true],
              ['Page exemplaire', false],
            ].map(([t, ok]) => (
              <li key={t as string} className="flex flex-col items-center gap-2">
                <span className={`grid size-14 place-items-center rounded-full ${ok ? 'border-2 border-amber-500 bg-amber-50 text-amber-700' : 'border border-dashed border-line text-fg-2'}`}>
                  {ok ? <Star className="size-5" aria-hidden /> : <Lock className="size-5" aria-hidden />}
                </span>
                <span className="text-fg">{t as string}</span>
              </li>
            ))}
          </ul>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ================================== Ma page ================================== */
export function EtabPage() {
  return (
    <Coque actif="page" titre="Ma page" sousTitre="Les douze sections de la page publique, dans l’ordre où les candidats les lisent">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ol className="space-y-2">
          {SECTIONS.map((s, k) => (
            <li key={s.n} className={`squircle-2xl flex flex-wrap items-center gap-4 border bg-bg p-4 ${s.s === 'vide' ? 'border-dashed border-line' : 'border-line'}`}>
              <span className="w-8 text-center text-2xl font-light tabular-nums text-fg-2">{String(k + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{s.n}</p>
                <p className="text-sm text-fg-2">
                  {s.d}
                  {'manque' in s && <span className="text-amber-700"> · {s.manque}</span>}
                </p>
              </div>
              <span className="hidden text-xs text-fg-2 md:block">{s.src}</span>
              <Statut s={s.s} />
              {s.s === 'auto' ? (
                <span className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-fg-2">
                  <Lock className="size-3.5" aria-hidden /> Lecture seule
                </span>
              ) : (
                <span className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium ${s.s === 'vide' ? 'bg-action text-action-foreground' : 'border border-line text-fg'}`}>
                  {s.s === 'vide' ? <Plus className="size-4" aria-hidden /> : <Pencil className="size-3.5" aria-hidden />} {s.s === 'vide' ? 'Remplir' : 'Modifier'}
                </span>
              )}
            </li>
          ))}
        </ol>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={PanelsTopLeft}>Complétude</TitreTuile>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-fg">70 %</p>
            <p className="text-sm text-fg-2">7 sections déclarées sur 10 publiées</p>
            <span className="mt-4 block h-2 rounded-full bg-line">
              <span className="block h-full w-[70%] rounded-full bg-teal" />
            </span>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-fg-2">Publiées</span><span className="font-medium text-fg">5</span></li>
              <li className="flex justify-between"><span className="text-fg-2">À compléter</span><span className="font-medium text-amber-700">3</span></li>
              <li className="flex justify-between"><span className="text-fg-2">Vides, masquées</span><span className="font-medium text-fg">2</span></li>
              <li className="flex justify-between"><span className="text-fg-2">Automatiques</span><span className="font-medium text-fg">2</span></li>
            </ul>
          </Tuile>
          <Tuile>
            <TitreTuile i={Lock}>Sections automatiques</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Résultats et registres viennent des sources publiques. Ils ne se modifient pas ici : une erreur se signale, et nous la vérifions auprès de la source.</p>
            <span className="mt-4 inline-flex text-sm font-medium text-fg underline underline-offset-4">Signaler une erreur</span>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ================================== Galerie ================================== */
const PHOTOS = [
  { src: '/images/demo/pexels-7800669.jpg', legende: 'Atelier de CFAO, deuxième année', couv: true },
  { src: '/images/demo/pexels-6627325.jpg', legende: 'Travaux pratiques de céramique' },
  { src: '/images/demo/pexels-3881296.jpg', legende: 'Contrôle d’une couronne' },
  { src: '/images/demo/pexels-19879741.jpg', legende: 'Portes ouvertes 2026' },
  { src: '/images/demo/pexels-8413334.jpg', legende: '' },
  { src: '/images/demo/pexels-6627447.jpg', legende: 'Atelier amovible' },
  { src: '/images/demo/pexels-6627471.jpg', legende: 'Remise des diplômes' },
  { src: '/images/demo/pexels-6627320.jpg', legende: 'Forum alternance' },
]

export function EtabGalerie() {
  return (
    <Coque
      actif="galerie"
      titre="Galerie"
      sousTitre="12 photos sur 24 · les 5 premières s’affichent sur la page"
      action={
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          <Upload className="size-4" aria-hidden /> Ajouter des photos
        </span>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {PHOTOS.map((p, i) => (
              <li key={p.src} className={`squircle-xl overflow-hidden border bg-bg ${i < 5 ? 'border-line' : 'border-dashed border-line opacity-80'}`}>
                <div className="relative aspect-[4/3]">
                  <Image src={p.src} alt="" fill sizes="20vw" className="object-cover" />
                  <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-black/55 text-white">
                    <GripVertical className="size-4" aria-hidden />
                  </span>
                  {'couv' in p && <span className="squircle-full absolute right-2 top-2 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#0e1317]">Grande photo</span>}
                  {i < 5 && !('couv' in p) && <span className="squircle-full absolute right-2 top-2 bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">Affichée</span>}
                </div>
                <div className="flex items-center gap-2 p-2.5">
                  <p className={`min-w-0 flex-1 truncate text-xs ${p.legende ? 'text-fg' : 'text-amber-700'}`}>{p.legende || 'Ajouter une légende'}</p>
                  <Pencil className="size-3.5 shrink-0 text-fg-2" aria-hidden />
                </div>
              </li>
            ))}
            <li className="squircle-xl grid aspect-[4/3] place-items-center border-2 border-dashed border-line text-center text-sm text-fg-2">
              <span>
                <ImagePlus className="mx-auto size-6" aria-hidden />
                <span className="mt-2 block">Déposer des photos</span>
                <span className="text-xs">JPG ou PNG, 12 encore possibles</span>
              </span>
            </li>
          </ol>
          <p className="mt-3 text-xs text-fg-2">Faites glisser pour changer l’ordre. Les cinq premières forment la mosaïque de la page ; la première est la grande photo.</p>
        </div>

        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={Copyright}>Crédit photo</TitreTuile>
            <label className="mt-4 block text-sm font-medium text-fg">Auteur ou détenteur des droits</label>
            <span className="squircle-lg mt-1.5 flex h-11 items-center border border-line bg-bg px-3 text-sm text-fg">Studio Lumière, Bordeaux</span>
            <label className="mt-4 flex items-center justify-between gap-3 text-sm text-fg">
              Afficher le crédit sous la galerie
              <span className="relative h-6 w-10 rounded-full bg-teal">
                <span className="absolute right-0.5 top-0.5 size-5 rounded-full bg-white shadow" />
              </span>
            </label>
            <label className="mt-3 flex items-center justify-between gap-3 text-sm text-fg">
              Crédit différent pour certaines photos
              <span className="relative h-6 w-10 rounded-full bg-line">
                <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow" />
              </span>
            </label>
            <div className="squircle-xl mt-5 bg-bg-soft p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-2">Sur la page</p>
              <p className="mt-1 text-xs text-fg-2">Crédit photo : Studio Lumière, Bordeaux</p>
            </div>
            <p className="mt-3 text-xs text-fg-2">Sans crédit, la page affiche « Photos publiées par l’établissement ».</p>
          </Tuile>
          <Tuile>
            <TitreTuile i={Camera}>Droits</TitreTuile>
            <label className="mt-3 flex items-start gap-3 text-sm text-fg-2">
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded bg-teal text-white">
                <CheckCircle2 className="size-3" aria-hidden />
              </span>
              L’établissement détient les droits de ces photos, et les personnes reconnaissables ont donné leur accord.
            </label>
            <p className="mt-4 text-xs text-fg-2">Chaque photo reste deux ans, puis vous êtes invité à la confirmer ou à la remplacer.</p>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ================================= Formations ================================= */
const FORMATIONS = [
  { nom: 'Bac pro Technicien en prothèse dentaire', niveau: 'Niveau 4', duree: '3 ans', places: '24', voies: 'Initiale, apprentissage', s: 'publiee' },
  { nom: 'BTS Prothésiste dentaire', niveau: 'Niveau 5', duree: '2 ans', places: '16', voies: 'Initiale, apprentissage', s: 'publiee' },
  { nom: 'BTMS Prothésiste dentaire', niveau: 'Niveau 5', duree: '2 ans', places: '—', voies: 'Apprentissage, continue', s: 'incomplete' },
] as const

function Champ({ l, v, auto, vide }: { l: string; v: string; auto?: boolean; vide?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm font-medium text-fg">
        {l} {auto && <span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-1.5 py-0.5 text-[10px] font-medium text-fg-2"><Lock className="size-2.5" aria-hidden /> RNCP</span>}
      </p>
      <span className={`squircle-lg mt-1.5 flex h-10 items-center border px-3 text-sm ${vide ? 'border-amber-300 bg-amber-50 text-amber-700' : auto ? 'border-line bg-bg-soft text-fg-2' : 'border-line bg-bg text-fg'}`}>{v}</span>
    </div>
  )
}

export function EtabFormations() {
  return (
    <Coque
      actif="formations"
      titre="Formations"
      sousTitre="Les diplômes préparés, rentrée 2027"
      action={
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          <Plus className="size-4" aria-hidden /> Ajouter une formation
        </span>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <Tuile className="p-0">
          <div className="grid grid-cols-[minmax(0,1fr)_5rem_8rem] items-center gap-4 border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-fg-2">
            <span>Diplôme</span>
            <span>Places</span>
            <span>Statut</span>
          </div>
          {FORMATIONS.map((f, i) => (
            <div key={f.nom} className={`grid grid-cols-[minmax(0,1fr)_5rem_8rem] items-center gap-4 border-b border-line px-5 py-4 text-sm last:border-0 ${i === 2 ? 'bg-bg-soft' : ''}`}>
              <span className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <span>
                  <span className="block font-medium text-fg">{f.nom}</span>
                  <span className="block text-xs text-fg-2">
                    {f.niveau} · {f.duree} · {f.voies}
                  </span>
                </span>
              </span>
              <span className={f.places === '—' ? 'text-amber-700' : 'text-fg'}>{f.places}</span>
              <Statut s={f.s} />
            </div>
          ))}
        </Tuile>

        {/* Panneau d'édition de la formation sélectionnée */}
        <aside className="squircle-2xl border border-line bg-bg shadow-pop">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <p className="text-xs text-fg-2">Modifier la formation</p>
              <p className="font-semibold text-fg">BTMS Prothésiste dentaire</p>
            </div>
            <X className="size-5 text-fg-2" aria-hidden />
          </div>
          <div className="space-y-4 p-5">
            <div>
              <p className="text-sm font-medium text-fg">Diplôme</p>
              <span className="squircle-lg mt-1.5 flex h-10 items-center gap-2 border border-line bg-bg px-3 text-sm text-fg">
                <Search className="size-4 text-fg-2" aria-hidden /> BTMS Prothésiste dentaire
              </span>
              <p className="mt-1 text-xs text-fg-2">Choisi dans le Répertoire national des certifications : niveau et code se remplissent seuls.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Champ l="Niveau" v="Niveau 5" auto />
              <Champ l="Code" v="RNCP XXXXX" auto />
              <Champ l="Durée" v="2 ans" />
              <Champ l="Places par an" v="À renseigner" vide />
            </div>
            <div>
              <p className="text-sm font-medium text-fg">Voies</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[['Formation initiale', false], ['Apprentissage', true], ['Formation continue', true]].map(([v, on]) => (
                  <span key={v as string} className={`squircle-full px-3 py-1 text-sm ring-1 ring-inset ${on ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg text-fg-2 ring-line'}`}>
                    {v as string}
                  </span>
                ))}
              </div>
            </div>
            <Champ l="Prérequis" v="Après un BTM ou un bac pro, en activité" />
            <div className="grid grid-cols-2 gap-3">
              <Champ l="Candidature" v="Dossier et entretien" />
              <Champ l="Rentrée" v="Septembre 2027" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line p-5">
            <p className="flex items-center gap-1.5 text-xs text-fg-2">
              <CalendarDays className="size-3.5" aria-hidden /> Confirmée le 12 septembre 2026
            </p>
            <span className="inline-flex h-10 items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">Enregistrer</span>
          </div>
        </aside>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-fg-2">
        <Images className="size-3.5" aria-hidden /> Chaque formation alimente sa carte sur la page, les filtres de l’annuaire des formations et la recherche par diplôme.
      </p>
    </Coque>
  )
}
