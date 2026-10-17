/** MAQUETTE. Tableau de bord d'une faculté d'odontologie : vue d'ensemble, accès aux études, centres de soins, cursus et internat. */
import Image from 'next/image'
import { CalendarDays, Check, GraduationCap, HeartPulse, Lock, Map, Pencil, Phone, Plus, Stethoscope } from 'lucide-react'
import { Coque, Statut, Tuile, TitreTuile } from './_coque'
import { Activite, Apercu, FraicheurTuile, Missions, TuileSombre } from './_commun'

/* ============================== Vue d'ensemble ============================== */
export function FacVue() {
  return (
    <Coque profil="faculte" actif="vue" titre="Vue d’ensemble" sousTitre="Lundi 12 octobre · page publiée depuis le 15 septembre">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette="Page en ligne"
          titre="Bonjour, Faculté d’odontologie"
          texte="Les lycéens qui préparent le PASS et les patients qui cherchent un soin à tarif conventionné arrivent sur votre page. Les horaires d’un centre de soins manquent."
          pct={64}
          legende="page complète"
          chiffres={[
            ['6 sur 9', 'sections déclarées publiées'],
            ['3', 'sections automatiques à jour'],
            ['30 janv.', 'prochaines portes ouvertes'],
            ['2 860', 'visites ce mois-ci'],
          ]}
          action={{ meta: '+8 % · 3 min', t: 'Horaires du centre de soins du campus', i: HeartPulse }}
        />
        <Apercu onglets={['Étudiants', 'Patients']}>
          <div className="squircle-xl dark overflow-hidden border border-line bg-background">
            <div className="relative aspect-[4/3]">
              <Image src="/images/demo/pexels-6627447.jpg" alt="" fill sizes="22rem" className="object-cover opacity-80" />
            </div>
            <div className="flex items-center gap-3 p-4">
              <span className="squircle-lg grid size-10 place-items-center bg-white text-xs font-bold text-[#0e1317]">UE</span>
              <div>
                <p className="text-sm font-semibold leading-tight text-white">Faculté d’odontologie</p>
                <p className="text-xs text-white/60">Université de l’Estuaire</p>
              </div>
            </div>
          </div>
        </Apercu>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Missions
          items={[
            { t: 'Horaires du second centre de soins', d: '3 min', gain: '+8 %', reco: true },
            { t: 'Calendrier des passerelles 2027', d: '2 min', gain: '+6 %' },
            { t: 'Vie étudiante', d: '4 min', gain: '+6 %' },
          ]}
        />
        <Tuile>
          <TitreTuile i={Lock}>Sections automatiques</TitreTuile>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ['Places en 2e année', '98 en 2026, arrêté du 2 avril'],
              ['Postes d’internat', '9 en 2026, Centre national de gestion'],
              ['Registres', 'UAI, SIRET, diplôme d’État au RNCP'],
            ].map(([k, v]) => (
              <li key={k} className="flex items-start justify-between gap-3">
                <span className="text-fg">{k}</span>
                <span className="text-right text-fg-2">{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-2">Lus dans les arrêtés publics chaque année. Ils ne se modifient pas ici.</p>
        </Tuile>
        <FraicheurTuile
          items={[
            { k: 'Centres de soins', v: 'Horaires manquants', p: 1, alerte: true },
            { k: 'Portes ouvertes', v: 'Dans 110 jours', p: 0.2 },
            { k: 'Accès aux études', v: 'Valable 11 mois', p: 0.08 },
          ]}
        />
      </div>
      <div className="mt-4">
        <Activite
          items={[
            ['Postes d’internat 2026 publiés automatiquement', '8 oct.'],
            ['Centre de soins du centre-ville : téléphone vérifié', '1er oct.'],
            ['Galerie : 6 photos ajoutées par le service communication', '22 sept.'],
            ['Page publiée, visible par les étudiants et les patients', '15 sept.'],
          ]}
        />
      </div>
    </Coque>
  )
}

/* ============================== Accès aux études ============================== */
const VOIES = [
  { t: 'Première année de santé', d: 'PASS ou L.AS dans l’université', quand: '1re année', ok: true },
  { t: 'Admission en deuxième année', d: 'Sur classement, épreuves écrites puis orales', quand: 'Fin de 1re année', ok: true },
  { t: 'Passerelles', d: 'Masters, diplômes paramédicaux ou d’ingénieur, sur dossier et entretien', quand: 'Dossier en mars', ok: false },
  { t: 'Inscription', d: 'Administrative à l’université, puis pédagogique', quand: 'Juillet', ok: true },
]
const CAPACITES = [
  ['2022', 86],
  ['2023', 90],
  ['2024', 92],
  ['2025', 95],
  ['2026', 98],
] as const

export function FacAcces() {
  return (
    <Coque profil="faculte" actif="acces" titre="Accès aux études" sousTitre="Les étapes affichées sur la page, de la première année de santé à l’inscription">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ol className="space-y-2">
          {VOIES.map((v, k) => (
            <li key={v.t} className="squircle-2xl flex flex-wrap items-center gap-4 border border-line bg-bg p-4">
              <span className="w-8 text-center text-2xl font-light tabular-nums text-fg-2">0{k + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{v.t}</p>
                <p className="text-sm text-fg-2">{v.d}</p>
              </div>
              <span className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${v.ok ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                <CalendarDays className="size-3.5" aria-hidden /> {v.ok ? v.quand : 'Date 2027 à confirmer'}
              </span>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg">
                <Pencil className="size-3.5" aria-hidden /> Modifier
              </span>
            </li>
          ))}
          <li className="squircle-2xl flex items-center gap-2 border border-dashed border-line p-4 text-sm font-medium text-fg">
            <Plus className="size-4" aria-hidden /> Ajouter une étape
          </li>
        </ol>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={GraduationCap} droite={<span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> Automatique</span>}>
              Places en 2e année
            </TitreTuile>
            <ul className="mt-5 flex h-36 items-end gap-3">
              {CAPACITES.map(([a, n], i) => (
                <li key={a} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums text-fg">{n}</span>
                  <span className={`w-full rounded-t-lg ${i === 4 ? 'bg-teal' : 'bg-teal/25'}`} style={{ height: Math.round((n / 98) * 80) }} />
                  <span className="text-xs tabular-nums text-fg-2">{a}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-fg-2">Source : arrêtés annuels fixant les capacités d’accueil. Le chiffre 2027 apparaîtra à sa publication.</p>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}

/* ============================== Centres de soins ============================== */
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function FacSoins() {
  return (
    <Coque
      profil="faculte"
      actif="soins"
      titre="Centres de soins"
      sousTitre="Ce que voient les patients dans « Se faire soigner à la faculté »"
      action={
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          <Plus className="size-4" aria-hidden /> Ajouter un centre
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { nom: 'Centre de soins dentaires du centre-ville', adresse: '3 Rue de la Faculté, 33000 Bordeaux', tel: '05 XX XX XX XX', jours: [1, 1, 1, 1, 1, 0], h: '8h30 à 17h00', delai: 'Environ 3 semaines', ok: true },
          { nom: 'Centre de soins dentaires du campus', adresse: '8 Allée des Hôpitaux, 33000 Bordeaux', tel: '05 XX XX XX XX', jours: [0, 0, 0, 0, 0, 0], h: 'À renseigner', delai: 'À renseigner', ok: false },
        ].map((c) => (
          <Tuile key={c.nom} className={c.ok ? '' : 'border-amber-300'}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold text-fg">
                  <Stethoscope className="size-4 text-teal" aria-hidden /> {c.nom}
                </p>
                <p className="mt-1 text-sm text-fg-2">{c.adresse}</p>
              </div>
              <Statut s={c.ok ? 'publiee' : 'incomplete'} />
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="font-medium text-fg">Téléphone de rendez-vous</p>
                <span className="squircle-lg mt-1.5 flex h-10 items-center gap-2 border border-line px-3 text-fg">
                  <Phone className="size-4 text-fg-2" aria-hidden /> {c.tel}
                  {c.ok && <span className="ml-auto text-xs text-teal">Vérifié le 1er octobre</span>}
                </span>
              </div>
              <div>
                <p className="font-medium text-fg">Jours d’ouverture</p>
                <div className="mt-1.5 grid grid-cols-6 gap-1.5">
                  {JOURS.map((j, i) => (
                    <span key={j} className={`squircle-lg grid h-9 place-items-center text-sm ring-1 ring-inset ${c.jours[i] ? 'bg-teal/10 font-medium text-teal ring-teal/30' : 'bg-bg text-fg-2 ring-line'}`}>
                      {j}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-fg">Horaires</p>
                  <span className={`squircle-lg mt-1.5 flex h-10 items-center border px-3 ${c.ok ? 'border-line text-fg' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>{c.h}</span>
                </div>
                <div>
                  <p className="font-medium text-fg">Délai pour un rendez-vous</p>
                  <span className={`squircle-lg mt-1.5 flex h-10 items-center border px-3 ${c.ok ? 'border-line text-fg' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>{c.delai}</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-fg">Soins proposés</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    ['Soins courants', true],
                    ['Prothèses', true],
                    ['Orthodontie', c.ok],
                    ['Chirurgie orale', true],
                    ['Enfants', c.ok],
                    ['Patients en situation de handicap', c.ok],
                  ].map(([t, on]) => (
                    <span key={t as string} className={`squircle-full inline-flex items-center gap-1 px-2.5 py-1 text-xs ring-1 ring-inset ${on ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg text-fg-2 ring-line'}`}>
                      {on ? <Check className="size-3" aria-hidden /> : null} {t as string}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Tuile>
        ))}
      </div>
      <p className="mt-4 text-xs text-fg-2">Les téléphones sont testés chaque semaine. Un centre sans horaires reste affiché, avec la mention « Horaires non communiqués ».</p>
    </Coque>
  )
}

/* ============================== Cursus et internat ============================== */
export function FacCursus() {
  return (
    <Coque profil="faculte" actif="cursus" titre="Cursus et internat" sousTitre="Le cursus est déclaré par la faculté ; les postes d’internat sont lus dans l’arrêté annuel">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <Tuile>
            <TitreTuile i={Map}>Cycles</TitreTuile>
            <ol className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['DFGSO', '2e et 3e années', 'Sciences fondamentales, simulateur'],
                ['DFASO', '4e et 5e années', 'Premiers soins en centre de soins'],
                ['Diplôme d’État', '6e année', 'Stage actif, soutenance de thèse'],
              ].map(([t, a, d]) => (
                <li key={t} className="squircle-xl border border-line p-4">
                  <p className="text-xs text-fg-2">{a}</p>
                  <p className="mt-1 font-semibold text-fg">{t}</p>
                  <p className="mt-2 text-sm text-fg-2">{d}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-fg">
                    <Pencil className="size-3" aria-hidden /> Modifier
                  </p>
                </li>
              ))}
            </ol>
          </Tuile>
          <Tuile>
            <TitreTuile i={GraduationCap} droite={<span className="text-sm font-medium text-fg">Ajouter</span>}>
              Diplômes après le diplôme d’État
            </TitreTuile>
            <ul className="mt-4 divide-y divide-line text-sm">
              {['Diplôme universitaire d’implantologie', 'Diplôme universitaire d’esthétique du sourire', 'Certificat d’études supérieures de parodontologie'].map((d) => (
                <li key={d} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-fg">{d}</span>
                  <Pencil className="size-3.5 text-fg-2" aria-hidden />
                </li>
              ))}
            </ul>
          </Tuile>
        </div>
        <Tuile>
          <TitreTuile i={Lock} droite={<span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">Automatique</span>}>
            Internat, postes 2026
          </TitreTuile>
          <ul className="mt-4 divide-y divide-line">
            {[
              ['Orthopédie dento-faciale', 4, [3, 3, 4, 4]],
              ['Chirurgie orale', 2, [2, 2, 2, 2]],
              ['Médecine bucco-dentaire', 3, [2, 2, 3, 3]],
            ].map(([s, n, h]) => (
              <li key={s as string} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-fg">{s as string}</p>
                  <p className="text-xs text-fg-2">2022 à 2025 : {(h as number[]).join(', ')}</p>
                </div>
                <p className="text-3xl font-semibold tabular-nums text-fg">{n as number}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-2">Source : arrêté annuel du Centre national de gestion. Une erreur se signale, nous la vérifions dans l’arrêté.</p>
        </Tuile>
      </div>
    </Coque>
  )
}
