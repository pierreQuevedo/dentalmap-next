/** MAQUETTE. Tableau de bord d'un laboratoire de prothèse : vue d'ensemble, délais, savoir-faire, zone, réalisations. */
import { Check, CheckCircle2, Clock, Cpu, Images, Minus, Plus, Route, Search, Truck, Wrench } from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { empriseAutour, clePosition } from '@/lib/annuaire/emprise'
import { Coque, Tuile, TitreTuile } from './_coque'
import { Activite, Apercu, EcranGalerie, FraicheurTuile, Missions, TuileSombre } from './_commun'

const LON = -0.6436
const LAT = 44.8386

const DELAIS = [
  { piece: 'Couronne zircone monolithique', jours: 5 },
  { piece: 'Couronne céramo-métallique', jours: 7 },
  { piece: 'Bridge trois éléments', jours: 8 },
  { piece: 'Couronne sur implant', jours: 10 },
  { piece: 'Châssis métallique', jours: 8 },
  { piece: 'Prothèse complète résine', jours: 10 },
  { piece: 'Gouttière', jours: 4 },
]

/* ============================== Vue d'ensemble ============================== */
export function LaboVue() {
  return (
    <Coque profil="labo" actif="vue" titre="Vue d’ensemble" sousTitre="Lundi 12 octobre · fiche publiée depuis le 2 septembre">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TuileSombre
          etiquette="Fiche en ligne"
          titre="Bonjour, Laboratoire Artemis Dentaire"
          texte="Les cabinets qui cherchent un laboratoire en zircone ou en implantologie autour de Mérignac vous trouvent. Vos délais sont à reconfirmer avant le 12 mars."
          pct={75}
          legende="→ 95 % possible"
          chiffres={[
            ['7 sur 9', 'filtres cabinets actifs'],
            ['0 sur 3', 'missions faites'],
            ['4 à 10 j', 'délais moyens publiés'],
            ['312', 'visites de cabinets ce mois-ci'],
          ]}
          action={{ meta: '+10 % · 3 min', t: 'Publier vos premières réalisations', i: Images }}
        />
        <Apercu onglets={['Cabinets', 'Google']}>
          <div className="squircle-xl overflow-hidden border border-line bg-bg-soft">
            <div className="p-4">
              <p className="text-sm font-semibold text-fg">Laboratoire Artemis Dentaire</p>
              <p className="text-xs text-fg-2">8 Avenue de la Somme, 33700 Mérignac</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Zircone', 'Implantologie', 'STL acceptés', 'Ramassage'].map((t) => (
                  <span key={t} className="squircle-full bg-bg px-2 py-0.5 text-[11px] text-fg ring-1 ring-inset ring-line">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-fg-2">Délais moyens de 4 à 10 j ouvrés · dessert 40 km</p>
            </div>
          </div>
        </Apercu>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Missions
          items={[
            { t: 'Publier vos réalisations', d: '3 min', gain: '+10 %', reco: true },
            { t: 'Déclaration ANSM', d: '2 min', gain: '+10 %' },
            { t: 'Présentation du laboratoire', d: '4 min', gain: '+5 %' },
          ]}
        />
        <Tuile>
          <TitreTuile i={Search}>Où les cabinets vous trouvent</TitreTuile>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['Zircone', true],
              ['Céramo-métal', true],
              ['Implantologie', true],
              ['Empreintes STL', true],
              ['Ramassage', true],
              ['Délais affichés', true],
              ['Amovible', true],
              ['Galerie', false],
              ['Déclaré ANSM', false],
            ].map(([t, ok]) => (
              <span
                key={t as string}
                className={`squircle-full inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ${ok ? 'bg-teal/10 text-teal' : 'border border-dashed border-line text-fg-2'}`}
              >
                {ok ? <Check className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />} {t as string}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-fg-2">7 filtres actifs sur 9. Les deux autres s’ouvrent avec les missions.</p>
        </Tuile>
        <FraicheurTuile
          items={[
            { k: 'Délais de fabrication', v: 'À reconfirmer dans 3 semaines', p: 0.85, alerte: true },
            { k: 'Zone et ramassage', v: 'Valable 11 mois', p: 0.08 },
            { k: 'Savoir-faire', v: 'Valable 11 mois', p: 0.08 },
          ]}
          note="Les délais se reconfirment tous les six mois ; au-delà de douze, ils ne sont plus affichés."
        />
      </div>
      <div className="mt-4">
        <Activite
          items={[
            ['Délais de la couronne sur implant passés de 12 à 10 j ouvrés', '3 oct.'],
            ['Zone desservie étendue à 40 km', '18 sept.'],
            ['Fiche publiée, visible par les cabinets', '2 sept.'],
            ['Base Sirene synchronisée, établissement ouvert', '28 sept.'],
          ]}
        />
      </div>
    </Coque>
  )
}

/* ================================== Délais ================================== */
export function LaboDelais() {
  const max = 10
  return (
    <Coque
      profil="labo"
      actif="delais"
      titre="Délais de fabrication"
      sousTitre="Délais moyens en jours ouvrés, de la réception de l’empreinte à l’expédition"
      action={
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          <CheckCircle2 className="size-4" aria-hidden /> Reconfirmer sans changement
        </span>
      }
    >
      <div className="squircle-2xl mb-4 flex flex-wrap items-center gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <Clock className="size-4" aria-hidden /> Confirmés le 12 septembre 2026. Rappel à cinq mois : reconfirmez avant le 12 mars 2027 pour qu’ils restent affichés.
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <Tuile className="p-0">
          <div className="grid grid-cols-[minmax(0,1fr)_11rem_3rem] items-center gap-4 border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-fg-2">
            <span>Pièce</span>
            <span className="text-center">Délai moyen</span>
            <span />
          </div>
          {DELAIS.map((d) => (
            <div key={d.piece} className="grid grid-cols-[minmax(0,1fr)_11rem_3rem] items-center gap-4 border-b border-line px-5 py-3 text-sm last:border-0">
              <span className="text-fg">{d.piece}</span>
              <span className="squircle-full mx-auto flex items-center gap-1 border border-line p-1">
                <span className="grid size-7 place-items-center rounded-full bg-bg-soft text-fg">
                  <Minus className="size-3.5" aria-hidden />
                </span>
                <span className="w-20 text-center font-semibold tabular-nums text-fg">{d.jours} j ouvrés</span>
                <span className="grid size-7 place-items-center rounded-full bg-bg-soft text-fg">
                  <Plus className="size-3.5" aria-hidden />
                </span>
              </span>
              <span className="text-right text-xs text-fg-2">Retirer</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-fg">
            <Plus className="size-4" aria-hidden /> Ajouter une pièce
            <span className="ml-2 font-normal text-fg-2">Inlay-core, facette, plaque de stabilisation…</span>
          </div>
        </Tuile>
        <Tuile>
          <TitreTuile i={Clock}>Sur la fiche</TitreTuile>
          <ul className="mt-5 space-y-3">
            {DELAIS.map((d) => (
              <li key={d.piece}>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="truncate text-fg">{d.piece}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-fg">{d.jours} j ouvrés</span>
                </div>
                <span className="mt-1.5 grid grid-cols-10 gap-0.5">
                  {Array.from({ length: max }, (_, j) => (
                    <span key={j} className={`h-2 ${j < d.jours ? (j === d.jours - 1 ? 'rounded-r-full bg-teal' : 'bg-teal/30') : 'bg-transparent'} ${j === 0 ? 'rounded-l-full' : ''}`} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-fg-2">La frise de la fiche publique, mise à jour en direct. Un délai moyen, pas un engagement : la fiche le dit aux cabinets.</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ================================ Savoir-faire ================================ */
function Choix({ titre, items, i: I }: { titre: string; items: [string, boolean][]; i: typeof Wrench }) {
  return (
    <Tuile>
      <TitreTuile i={I} droite={<span className="text-xs text-fg-2">{items.filter((x) => x[1]).length} choisis</span>}>
        {titre}
      </TitreTuile>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map(([t, ok]) => (
          <span key={t} className={`squircle-full inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ring-1 ring-inset ${ok ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg text-fg-2 ring-line'}`}>
            {ok && <Check className="size-3.5" aria-hidden />} {t}
          </span>
        ))}
      </div>
    </Tuile>
  )
}

export function LaboSavoir() {
  return (
    <Coque profil="labo" actif="savoir" titre="Savoir-faire" sousTitre="Ce que les cabinets filtrent pour choisir un laboratoire">
      <div className="grid gap-4 lg:grid-cols-2">
        <Choix
          titre="Techniques"
          i={Wrench}
          items={[
            ['Céramo-métallique', true],
            ['Zircone monolithique', true],
            ['Vitrocéramique', true],
            ['Prothèse sur implants', true],
            ['Châssis métallique', true],
            ['Prothèse complète résine', true],
            ['Gouttières et orthèses', true],
            ['Orthodontie', false],
            ['Facettes', false],
            ['Inlay-core', false],
          ]}
        />
        <Choix
          titre="Matériaux"
          i={Wrench}
          items={[
            ['Zircone', true],
            ['Disilicate de lithium', true],
            ['Cobalt-chrome', true],
            ['Titane', true],
            ['PMMA', true],
            ['Or', false],
            ['PEEK', false],
          ]}
        />
        <Tuile className="lg:col-span-2">
          <TitreTuile i={Cpu}>Numérique</TitreTuile>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['Empreintes numériques', 'Fichiers STL de tous les scanners intra-oraux', true],
              ['Usinage sur place', 'Fraiseuse cinq axes, zircone et titane', true],
              ['Impression 3D', 'Modèles, guides chirurgicaux, gouttières', true],
            ].map(([t, d, ok]) => (
              <li key={t as string} className="squircle-xl flex items-start justify-between gap-3 border border-line p-4">
                <div>
                  <p className="text-sm font-semibold text-fg">{t as string}</p>
                  <p className="mt-1 text-sm text-fg-2">{d as string}</p>
                </div>
                <span className={`relative h-6 w-10 shrink-0 rounded-full ${ok ? 'bg-teal' : 'bg-line'}`}>
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${ok ? 'right-0.5' : 'left-0.5'}`} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-2">Confirmé le 12 septembre 2026, valable un an. Chaque choix ouvre un filtre dans la recherche des cabinets.</p>
        </Tuile>
      </div>
    </Coque>
  )
}

/* ============================== Zone et logistique ============================== */
export function LaboZone() {
  return (
    <Coque profil="labo" actif="zone" titre="Zone et logistique" sousTitre="Les cabinets de la zone vous voient dans leurs recherches">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="squircle-2xl relative h-[34rem] overflow-hidden border border-line">
          <Carte profession="prothesistes" emprise={empriseAutour(LON, LAT, 50000)} className="size-full" survol={clePosition(LON, LAT)} />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="aspect-square h-[78%] rounded-full border-2 border-dashed border-teal bg-teal/10" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 squircle-xl flex items-center gap-4 bg-bg/95 p-4 ring-1 ring-line">
            <span className="text-sm font-medium text-fg">Rayon</span>
            <span className="relative h-1.5 flex-1 rounded-full bg-line">
              <span className="absolute inset-y-0 left-0 w-[40%] rounded-full bg-teal" />
              <span className="absolute left-[40%] top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal bg-bg" />
            </span>
            <span className="w-14 text-right text-sm font-semibold tabular-nums text-fg">40 km</span>
          </div>
        </div>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={Truck}>Ramassage</TitreTuile>
            <p className="mt-4 text-sm text-fg-2">Jours de passage dans les cabinets</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((j) => (
                <span key={j} className="squircle-lg grid h-10 place-items-center bg-teal/10 text-sm font-medium text-teal ring-1 ring-inset ring-teal/30">
                  {j}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-fg-2">Secteur de ramassage</p>
            <span className="squircle-lg mt-1.5 flex h-10 items-center border border-line px-3 text-sm text-fg">Bordeaux Métropole</span>
          </Tuile>
          <Tuile>
            <TitreTuile i={Route}>Au-delà de la zone</TitreTuile>
            <p className="mt-4 flex items-center justify-between gap-3 text-sm text-fg">
              Envoi par transporteur
              <span className="relative h-6 w-10 rounded-full bg-teal">
                <span className="absolute right-0.5 top-0.5 size-5 rounded-full bg-white shadow" />
              </span>
            </p>
            <p className="mt-3 text-xs text-fg-2">La fiche indique « Envoi par transporteur au-delà de 40 km ».</p>
          </Tuile>
          <p className="px-1 text-xs text-fg-2">412 cabinets dentaires dans ce rayon, d’après l’annuaire.</p>
        </aside>
      </div>
    </Coque>
  )
}

/* ================================ Réalisations ================================ */
export function LaboRealisations() {
  return (
    <EcranGalerie
      profil="labo"
      actif="realisations"
      titre="Réalisations"
      sousTitre="4 photos sur 8 · elles s’affichent dans la citation de la fiche"
      photos={[
        { src: '/images/demo/pexels-6627325.jpg', legende: 'Bridge zircone, quatre éléments' },
        { src: '/images/demo/pexels-7800669.jpg', legende: 'Couronnes sur implants' },
        { src: '/images/demo/pexels-3881296.jpg', legende: 'Châssis cobalt-chrome' },
        { src: '/images/demo/pexels-19879741.jpg', legende: '' },
      ]}
      credit="Laboratoire Artemis Dentaire"
      sujet="fiche"
      droits="Le laboratoire détient les droits de ces photos, et aucun patient n’y est reconnaissable."
    />
  )
}
