'use client'

import { useState } from 'react'
import { ArrowRight, Award, Lock, MapPin, Sparkles, Trophy, UserPlus } from 'lucide-react'
import { BarreProgression, CarteProgression, CheminPaliers, Medaille, PassagePalier, StylesProgression, ToastGain, type CarteAMontrer } from '@/components/espace/progression'
import { FondCarte } from '@/components/espace/fond-carte'
import { ComparaisonVisuels } from './_visuels'
import { ICONE_GAIN } from '@/components/espace/icones-gain'
import { BAREME, PALIERS, POINTS_MAX, progressionDe, type CleGain, type Points } from '@/lib/espace-pro/progression'

/** Bordeaux, 76 rue de la Liberté : la fiche de test. */
const LIEU = { lon: -0.600974, lat: 44.839172 }

/** La carte de résultat de la fiche de test, pour le passage de palier. */
const CARTE: CarteAMontrer = {
  profession: 'dentiste',
  photo: null,
  praticien: {
    slug: 'dr-test-dentalmap-0004',
    lieuId: 'test',
    civilite: 'M',
    nom: 'DENTALMAP',
    prenom: 'TEST',
    raisonSociale: null,
    statutVerification: 'verifie',
    adresseLigne: '76 RUE DE LA LIBERTE',
    codePostal: '33200',
    aTelephone: true,
    revendiquee: true,
    communeNom: 'Bordeaux',
    communeSlug: 'bordeaux',
    departementSlug: 'gironde',
    precisionPosition: 'numero',
    ...LIEU,
    metres: 0,
  },
}

/** Une fiche simulée : ce qui est acquis pour un total donné, dans l'ordre où un praticien l'obtient d'ordinaire. */
function simuler(total: number): Points {
  const fiche = Math.min(100, total)
  let reste = Math.max(0, total - 100)
  const prendre = (n: number) => {
    const v = Math.min(n, reste)
    reste -= v
    return v
  }
  const detail: Record<CleGain, number> = { fiche, google: prendre(20), a_jour: prendre(10), badge: prendre(15), partage: prendre(10), parrainage: prendre(75) }
  return { total, detail, verifiee: true }
}

export function Progression() {
  const [points, setPoints] = useState(142)
  const [gain, setGain] = useState<{ cle: number; de: number; a: number; titre: string } | null>(null)
  const [palier, setPalier] = useState<number | null>(null)

  const jouerGain = () => {
    const de = Math.min(points, 88)
    setPoints(de + 12)
    setGain({ cle: Date.now(), de, a: de + 12, titre: 'Photo de profil ajoutée' })
  }
  const jouerPalier = (n = 3) => {
    setPoints(PALIERS[n - 1].seuil)
    setPalier(n)
  }

  return (
    <div className="min-h-dvh bg-bg-soft pb-24">
      <StylesProgression />
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
          <p className="text-sm font-semibold text-fg">Maquette · Progression</p>
          <label className="flex flex-1 items-center gap-3 text-sm text-fg-2">
            Points simulés
            <input type="range" min={0} max={POINTS_MAX} value={points} onChange={(e) => setPoints(Number(e.target.value))} className="flex-1 accent-teal" />
            <span className="w-16 font-mono text-fg">{points}</span>
          </label>
          <button type="button" onClick={jouerGain} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
            <Sparkles className="size-4" aria-hidden /> Jouer un gain
          </button>
          <button type="button" onClick={() => jouerPalier()} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium text-fg">
            <Trophy className="size-4" aria-hidden /> Jouer un palier
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-6 pt-10">
        <Section numero="1" titre="Le barème" texte={`Des points de visibilité, ${POINTS_MAX} au plus : la fiche en apporte 100, le reste vient de ce que le praticien fait pour la faire connaître.`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BAREME.map((b) => {
              const I = ICONE_GAIN[b.cle]
              const fait = simuler(points).detail[b.cle]
              return (
                <div key={b.cle} className={`squircle-2xl flex gap-3 border bg-bg p-4 ${fait ? 'border-teal/30' : 'border-line'}`}>
                  <span className={`squircle-lg grid size-10 shrink-0 place-items-center ${fait ? 'bg-teal/15 text-teal' : 'bg-bg-soft text-fg-2'}`}>
                    <I className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold text-fg">{b.libelle}</p>
                      <span className="shrink-0 font-mono text-xs font-semibold text-teal">{b.points}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-fg-2">{b.detail}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex-1">
                        <BarreProgression part={fait / b.max} />
                      </span>
                      <span className="text-[11px] text-fg-2">
                        {fait}/{b.max}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        <Section numero="2" titre="Les paliers et leurs gains" texte="Chaque palier débloque quelque chose de concret ; Ambassadeur et Référence locale ajoutent un bonus de mise en avant tant qu’ils sont tenus.">
          <CheminPaliers points={points} />
        </Section>

        <Section numero="3" titre="La carte du menu" texte="En bas du menu, en sombre : palier, points, ce qu’il reste avant le suivant. Elle mène à Progression ; chaque pastille de points mène droit à l’endroit où on les gagne, en plein si acquis, en pointillés sinon.">
          <div className="flex flex-wrap gap-6">
            {[points, 96, 158, POINTS_MAX].map((p, i) => (
              <figure key={i} className="space-y-2">
                <div className="w-[15rem] rounded-2xl bg-bg-soft p-4 ring-1 ring-line">
                  <CarteProgression points={simuler(p)} distinctions="/maquettes/progression/" q="" />
                </div>
                <figcaption className="text-center text-xs text-fg-2">{['Simulée', 'Juste avant un palier', 'Juste avant Ambassadeur', 'Au sommet'][i]}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section numero="4" titre="Le gain d’une mission" texte="À chaque enregistrement qui rapporte : la coche, les points qui montent, la barre qui avance. Il se ferme seul après cinq secondes.">
          <div className="max-w-sm">
            <ToastGain de={88} a={100} titre="Photo de profil ajoutée" statique />
          </div>
        </Section>

        <Section numero="5" titre="Le passage de palier" texte="Plein écran, une fois par palier, sur le fond des stories : la carte de résultat apparaît au palier d’avant puis s’habille du nouveau, les gains débloqués tiennent en une ligne, et des confettis partent de partout aux couleurs de la charte.">
          <div className="flex flex-wrap gap-2">
            {PALIERS.slice(1).map((p) => (
              <button key={p.niveau} type="button" onClick={() => jouerPalier(p.niveau)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
                <Trophy className="size-4" aria-hidden /> Palier {p.niveau} · {p.nom}
              </button>
            ))}
          </div>
        </Section>

        <Section numero="6" titre="Les visuels de partage, palier par palier" texte="Story et publication, avec le message « Ma fiche » et, dès le palier 2, « Mon palier » : la carte de résultat de chaque visuel porte l’habillage de son palier. Le champ photo prend une adresse d’image ; vide, la carte montre l’illustration.">
          <ComparaisonVisuels carte={CARTE} />
        </Section>

        <Section numero="7" titre="La page Progression" texte="Branchée dans l’espace pro : palier, chemin, comment gagner des points, distinctions, historique.">
          <ApercuDistinctions points={points} />
        </Section>
      </main>

      {gain && <ToastGain key={gain.cle} de={gain.de} a={gain.a} titre={gain.titre} fermer={() => setGain(null)} />}
      {palier && <PassagePalier key={palier} palier={PALIERS[palier - 1]} fermer={() => setPalier(null)} lon={LIEU.lon} lat={LIEU.lat} partager="/maquettes/progression/" distinctions="/maquettes/progression/" carte={CARTE} />}
    </div>
  )
}

function Section({ numero, titre, texte, children }: { numero: string; titre: string; texte: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="font-mono text-xs tracking-widest text-teal">{numero.padStart(2, '0')}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{titre}</h2>
      <p className="mt-1 max-w-2xl text-sm text-fg-2">{texte}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

const HISTORIQUE = [
  { quand: 'Aujourd’hui', texte: 'Photo de profil ajoutée', points: 12, i: Sparkles },
  { quand: 'Hier', texte: 'Parrainage réussi : Dr Martin', points: 25, i: UserPlus },
  { quand: '14 oct.', texte: 'Lien vérifié sur votre fiche Google', points: 20, i: MapPin },
  { quand: '12 oct.', texte: 'Fiche publiée', points: 0, i: Trophy },
]

function ApercuDistinctions({ points }: { points: number }) {
  const p = progressionDe(points)
  return (
    <div className="squircle-2xl overflow-hidden bg-bg ring-1 ring-line">
      <div className="relative overflow-hidden text-white">
        <FondCarte lon={LIEU.lon} lat={LIEU.lat} zoom={14.4} decalage={{ x: 160, y: 0 }} />
        <div className="relative flex flex-wrap items-center gap-6 p-6 sm:p-8">
          <Medaille niveau={p.actuel?.niveau ?? 0} taille={96} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs tracking-[0.2em] text-[#BFE3D6]">
              PALIER {p.actuel?.niveau ?? 0} SUR {PALIERS.length} · {points} PTS
            </p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight">{p.actuel?.nom ?? 'En route vers la publication'}</h3>
            <div className="mt-4 max-w-md">
              <BarreProgression part={p.part} epaisse claire />
              <p className="mt-2 text-sm text-white/85">{p.suivant ? `Plus que ${p.reste} points avant ${p.suivant.nom}.` : 'Tout est débloqué.'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <ul className="divide-y divide-line rounded-2xl ring-1 ring-line">
          {BAREME.slice(1, 5).map((b) => {
            const I = ICONE_GAIN[b.cle]
            return (
              <li key={b.cle} className="flex items-center gap-3 p-3.5">
                <span className="squircle-lg grid size-9 place-items-center bg-bg-soft text-fg">
                  <I className="size-4" aria-hidden />
                </span>
                <p className="min-w-0 flex-1 text-sm font-medium text-fg">{b.libelle}</p>
                <span className="squircle-full bg-teal/10 px-2 py-0.5 font-mono text-xs font-semibold text-teal">{b.points}</span>
                <ArrowRight className="size-4 text-fg-2" aria-hidden />
              </li>
            )
          })}
        </ul>
        <ol className="space-y-3">
          {HISTORIQUE.map((h) => (
            <li key={h.texte} className="flex gap-3">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${h.points ? 'bg-teal/10 text-teal' : 'bg-[#134E4A] text-[#BFE3D6]'}`}>
                <h.i className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-fg">{h.texte}</p>
                <p className="text-xs text-fg-2">{h.quand}</p>
              </div>
              {h.points > 0 && <span className="font-mono text-xs font-semibold text-teal">+{h.points}</span>}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex gap-3 border-t border-line p-6 sm:px-8">
        {[true, true, points >= 100, points >= 160].map((ok, i) => (
          <span key={i} className={`grid size-12 place-items-center rounded-full ${ok ? 'bg-gradient-to-br from-[#1F6B64] to-[#134E4A] text-[#BFE3D6]' : 'border border-dashed border-line text-fg-2'}`}>
            {ok ? <Award className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
          </span>
        ))}
      </div>
    </div>
  )
}
