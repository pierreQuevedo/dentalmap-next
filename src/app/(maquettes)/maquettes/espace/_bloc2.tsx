/** MAQUETTE. Bloc 2 : Ma fiche labo, Admission et calendrier, Événements, Ma page faculté. */
import { CalendarDays, CheckCircle2, Clock, Lock, Pencil, Plus } from 'lucide-react'
import { Coque, Statut, Tuile, TitreTuile, type Profil } from './_coque'

type Bloc = { n: string; d: string; s: 'publiee' | 'incomplete' | 'vide' | 'auto'; src: string; manque?: string }

function ListeBlocs({ blocs }: { blocs: Bloc[] }) {
  return (
    <ol className="space-y-2">
      {blocs.map((b, k) => (
        <li key={b.n} className={`squircle-2xl flex flex-wrap items-center gap-4 border bg-bg p-4 ${b.s === 'vide' ? 'border-dashed border-line' : 'border-line'}`}>
          <span className="w-8 text-center text-2xl font-light tabular-nums text-fg-2">{String(k + 1).padStart(2, '0')}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-fg">{b.n}</p>
            <p className="text-sm text-fg-2">
              {b.d}
              {b.manque && <span className="text-amber-700"> · {b.manque}</span>}
            </p>
          </div>
          <span className="hidden text-xs text-fg-2 md:block">{b.src}</span>
          <Statut s={b.s} />
          {b.s === 'auto' ? (
            <span className="inline-flex h-9 items-center gap-1.5 px-3 text-sm text-fg-2">
              <Lock className="size-3.5" aria-hidden /> Lecture seule
            </span>
          ) : (
            <span className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium ${b.s === 'vide' ? 'bg-action text-action-foreground' : 'border border-line text-fg'}`}>
              {b.s === 'vide' ? <Plus className="size-4" aria-hidden /> : <Pencil className="size-3.5" aria-hidden />} {b.s === 'vide' ? 'Remplir' : 'Modifier'}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

function Completude({ pct, lignes, note, titre = 'Complétude' }: { pct: number; lignes: [string, string, boolean?][]; note: string; titre?: string }) {
  return (
    <Tuile>
      <TitreTuile i={CheckCircle2}>{titre}</TitreTuile>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-fg">{pct} %</p>
      <span className="mt-4 block h-2 rounded-full bg-line">
        <span className="block h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
      </span>
      <ul className="mt-5 space-y-2 text-sm">
        {lignes.map(([k, v, a]) => (
          <li key={k} className="flex justify-between">
            <span className="text-fg-2">{k}</span>
            <span className={`font-medium ${a ? 'text-amber-700' : 'text-fg'}`}>{v}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-fg-2">{note}</p>
    </Tuile>
  )
}

/* =============================== Ma fiche labo =============================== */
export function LaboFiche() {
  return (
    <Coque profil="labo" actif="fiche" titre="Ma fiche" sousTitre="Les blocs de la fiche publique, dans l’ordre où les cabinets les lisent">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ListeBlocs
          blocs={[
            { n: 'Présentation', d: 'La citation en tête de fiche, 200 à 800 caractères', s: 'vide', src: 'Déclaré' },
            { n: 'Réalisations', d: '2 photos sur 4 recommandées, crédit renseigné', s: 'incomplete', src: 'Déclaré', manque: '2 photos de plus' },
            { n: 'Savoir-faire', d: '7 techniques', s: 'publiee', src: 'Déclaré' },
            { n: 'Matériaux et numérique', d: '5 matériaux · STL, usinage, impression 3D', s: 'publiee', src: 'Déclaré' },
            { n: 'Délais de fabrication', d: '7 pièces, de 4 à 10 j ouvrés', s: 'incomplete', src: 'Déclaré', manque: 'à reconfirmer avant le 12 mars' },
            { n: 'Zone et logistique', d: '40 km, ramassage chaque jour ouvré', s: 'publiee', src: 'Déclaré' },
            { n: 'Conformité ANSM', d: 'Déclaration envoyée le 10 octobre', s: 'incomplete', src: 'Déclaré et vérifié', manque: 'en vérification' },
            { n: 'Liens et contact', d: 'Site du laboratoire, téléphone', s: 'publiee', src: 'Déclaré' },
            { n: 'Ce que dit le registre', d: 'SIREN, activité 32.50A, établissement ouvert', s: 'auto', src: 'Base Sirene' },
          ]}
        />
        <aside className="space-y-4">
          <Completude
            titre="Force de la fiche"
            pct={75}
            lignes={[
              ['Publiés', '4'],
              ['À compléter', '3', true],
              ['Vides', '1'],
              ['Automatiques', '1'],
            ]}
            note="La force ne change jamais votre place dans les résultats des cabinets, triés par distance."
          />
        </aside>
      </div>
    </Coque>
  )
}

/* ============================ Admission et calendrier ============================ */
const MOIS = ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.']
const PERIODES: { f: string; plat: string; debut: number; fin: number; ok: boolean }[] = [
  { f: 'Bac pro Technicien en prothèse dentaire', plat: 'Affelnet', debut: 3, fin: 5, ok: true },
  { f: 'BTS Prothésiste dentaire', plat: 'Parcoursup', debut: 0, fin: 2, ok: false },
  { f: 'BTMS Prothésiste dentaire', plat: 'Dossier à l’école', debut: 1, fin: 4, ok: true },
]

export function EtabAdmission() {
  return (
    <Coque profil="etablissement" actif="admission" titre="Admission et calendrier" sousTitre="Quand et comment candidater, formation par formation, pour la rentrée 2027">
      <Tuile>
        <TitreTuile i={CalendarDays} droite={<span className="squircle-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">1 période à confirmer</span>}>
          Périodes de candidature 2027
        </TitreTuile>
        <div className="mt-5 grid grid-cols-[minmax(14rem,18rem)_repeat(9,minmax(0,1fr))_6rem] items-center gap-y-3 text-sm">
          <span />
          {MOIS.map((m) => (
            <span key={m} className="text-center text-xs text-fg-2">
              {m}
            </span>
          ))}
          <span />
          {PERIODES.map((p) => (
            <div key={p.f} className="contents">
              <span className="pr-4">
                <span className="block font-medium text-fg">{p.f}</span>
                <span className="block text-xs text-fg-2">{p.plat}</span>
              </span>
              {MOIS.map((m, i) => (
                <span key={m} className="px-0.5">
                  <span
                    className={`block h-7 ${i >= p.debut && i <= p.fin ? (p.ok ? 'bg-teal/80' : 'border-2 border-dashed border-amber-400 bg-amber-50') : 'bg-bg-soft'} ${i === p.debut ? 'rounded-l-full' : ''} ${i === p.fin ? 'rounded-r-full' : ''}`}
                  />
                </span>
              ))}
              <span className="pl-3 text-right">
                <span className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 text-xs font-medium text-fg">
                  <Pencil className="size-3" aria-hidden /> Modifier
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-fg-2">Les dates de Parcoursup et d’Affelnet sont proposées d’après le calendrier national ; la période en pointillé reprend 2026 tant qu’elle n’est pas confirmée.</p>
      </Tuile>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Tuile>
          <TitreTuile i={Clock} droite={<span className="text-sm font-medium text-fg">Ajouter une étape</span>}>
            Étapes de sélection
          </TitreTuile>
          <ol className="mt-4 divide-y divide-line">
            {[
              ['Vous candidatez', 'Janvier à mars'],
              ['L’école étudie votre dossier', 'Mars'],
              ['Entretien et test manuel', 'Avril'],
              ['Résultats et inscription', 'Mai à juillet'],
            ].map(([t, q], i) => (
              <li key={t} className="flex items-center gap-4 py-3">
                <span className="w-8 text-xl font-light tabular-nums text-fg-2">0{i + 1}</span>
                <span className="flex-1 font-medium text-fg">{t}</span>
                <span className="squircle-full bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal">{q}</span>
                <Pencil className="size-4 text-fg-2" aria-hidden />
              </li>
            ))}
          </ol>
        </Tuile>
        <Tuile>
          <TitreTuile i={CheckCircle2}>Ce que l’école attend</TitreTuile>
          <ul className="mt-4 space-y-2 text-sm text-fg">
            {['Goût pour le travail manuel de précision', 'Bonne vision des couleurs', 'Stage d’observation en laboratoire conseillé'].map((x) => (
              <li key={x} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {x}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium text-fg">Modifier</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ================================= Événements ================================= */
type Evt = { date: string; t: string; d: string; insc?: string; passe?: boolean }
const EVTS: Record<'etablissement' | 'faculte', Evt[]> = {
  etablissement: [
    { date: '6 févr. 2027', t: 'Journée portes ouvertes', d: '9h00 à 16h00, visite des ateliers', insc: 'Sans inscription' },
    { date: '14 mars 2027', t: 'Mini-stage d’une journée', d: 'Pour les élèves de 3e et de terminale', insc: '12 inscrits sur 20' },
    { date: '22 mai 2027', t: 'Forum alternance', d: 'Rencontre avec les laboratoires qui recrutent', insc: 'Sans inscription' },
    { date: '27 sept. 2026', t: 'Journée d’intégration', d: 'Disparue de la page le 28 septembre', passe: true },
  ],
  faculte: [
    { date: '30 janv. 2027', t: 'Journée portes ouvertes', d: '9h00 à 13h00, PASS, L.AS et centres de soins', insc: 'Sans inscription' },
    { date: '12 mars 2027', t: 'Réunion passerelles', d: 'Admission directe en deuxième année', insc: 'Sur inscription' },
    { date: '18 juin 2027', t: 'Journée de la recherche', d: 'Travaux des doctorants et des internes', insc: 'Sans inscription' },
    { date: '3 oct. 2026', t: 'Rentrée solennelle', d: 'Disparue de la page le 4 octobre', passe: true },
  ],
}

export function Evenements({ profil }: { profil: 'etablissement' | 'faculte' }) {
  return (
    <Coque
      profil={profil as Profil}
      actif="evenements"
      titre="Événements"
      sousTitre="Portes ouvertes et rendez-vous. Un événement passé disparaît de la page de lui-même"
      action={
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          <Plus className="size-4" aria-hidden /> Ajouter un événement
        </span>
      }
    >
      <ul className="space-y-2">
        {EVTS[profil].map((e) => (
          <li key={e.t} className={`squircle-2xl flex flex-wrap items-center gap-5 border p-5 ${e.passe ? 'border-dashed border-line bg-bg-soft' : 'border-line bg-bg'}`}>
            <span className={`squircle-xl grid w-24 shrink-0 place-items-center py-3 text-center ${e.passe ? 'bg-bg text-fg-2' : 'bg-teal/10 text-teal'}`}>
              <span className="text-2xl font-semibold leading-none">{e.date.split(' ')[0]}</span>
              <span className="mt-1 text-xs">{e.date.split(' ').slice(1).join(' ')}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${e.passe ? 'text-fg-2' : 'text-fg'}`}>{e.t}</p>
              <p className="text-sm text-fg-2">{e.d}</p>
            </div>
            {e.insc && <span className="text-sm text-fg-2">{e.insc}</span>}
            {e.passe ? <span className="text-sm text-fg-2">Passé</span> : (
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg">
                <Pencil className="size-3.5" aria-hidden /> Modifier
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-fg-2">La prochaine date s’affiche aussi dans le héros de la page et dans la barre mobile.</p>
    </Coque>
  )
}

/* ============================== Ma page faculté ============================== */
export function FacPage() {
  return (
    <Coque profil="faculte" actif="page" titre="Ma page" sousTitre="Les sections de la page publique, pour les étudiants et pour les patients">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ListeBlocs
          blocs={[
            { n: 'Héros', d: 'Nom, université, logo, portes ouvertes', s: 'publiee', src: 'Déclaré et UAI' },
            { n: 'Présentation', d: 'Accroche et texte de présentation', s: 'publiee', src: 'Déclaré' },
            { n: 'Galerie', d: '18 photos, crédit photo renseigné', s: 'publiee', src: 'Déclaré' },
            { n: 'Accès aux études', d: '4 étapes · places en 2e année automatiques', s: 'incomplete', src: 'Déclaré et arrêtés', manque: 'date 2027 des passerelles' },
            { n: 'Cursus', d: '3 cycles, 3 diplômes après le diplôme d’État', s: 'publiee', src: 'Déclaré et RNCP' },
            { n: 'Internat', d: '3 spécialités, postes 2026', s: 'auto', src: 'Centre national de gestion' },
            { n: 'Se faire soigner', d: '2 centres de soins', s: 'incomplete', src: 'Déclaré', manque: 'horaires du centre du campus' },
            { n: 'Vie étudiante', d: 'Bibliothèque, restauration, logement, handicap', s: 'vide', src: 'Déclaré' },
            { n: 'Coûts et aides', d: 'Droits nationaux, CVEC, bourses', s: 'publiee', src: 'Déclaré' },
            { n: 'Portes ouvertes et rendez-vous', d: '3 événements à venir', s: 'publiee', src: 'Déclaré' },
            { n: 'Accès et contacts', d: '3 contacts, site web', s: 'publiee', src: 'Déclaré' },
            { n: 'Registres', d: 'UAI, SIRET, diplôme au RNCP', s: 'auto', src: 'Référentiels publics' },
          ]}
        />
        <aside className="space-y-4">
          <Completude
            pct={64}
            lignes={[
              ['Publiées', '7'],
              ['À compléter', '2', true],
              ['Vides, masquées', '1'],
              ['Automatiques', '2'],
            ]}
            note="Une section vide n’apparaît pas sur la page publique."
          />
        </aside>
      </div>
    </Coque>
  )
}
