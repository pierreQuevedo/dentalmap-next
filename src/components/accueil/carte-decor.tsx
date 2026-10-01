/**
 * Fond de carte de l'accueil.
 *
 * Volontairement dessiné, pas chargé. La carte réelle de `components/map` pèse
 * MapLibre, un style vectoriel et une requête de tuiles par déplacement : la
 * poser derrière un titre coûterait le plus gros point de contact de la page
 * pour un élément que personne ne manipule. Un fond de plan OpenStreetMap
 * demanderait en plus une attribution visible, ce qui n'a aucun sens sur un
 * décor.
 *
 * Ce qui est montré ici n'est donc pas une ville existante mais une trame de
 * rues plausible, dans les teintes de la carte réelle, pour que le passage de
 * l'accueil à `/recherche/` ne surprenne pas.
 *
 * Les positions sont tirées d'un générateur à graine fixe et calculées au
 * chargement du module : le serveur et le client produisent exactement le même
 * SVG, sans quoi l'hydratation signalerait une divergence à chaque rendu.
 */
function generateur(graine: number) {
  let etat = graine
  return () => {
    etat = (etat * 1664525 + 1013904223) % 4294967296
    return etat / 4294967296
  }
}

const alea = generateur(20260916)

const PAS_X = 132
const PAS_Y = 116

/** Îlots bâtis, un par maille de la trame, avec un retrait et une hauteur variables. */
const BLOCS = (() => {
  const blocs: { x: number; y: number; w: number; h: number; o: number }[] = []
  for (let x = -520; x < 2160; x += PAS_X) {
    for (let y = -420; y < 1460; y += PAS_Y) {
      // Une maille sur six reste vide : une ville sans respiration fait moquette.
      if (alea() < 0.17) continue
      const retrait = 14 + alea() * 22
      blocs.push({
        x: x + retrait,
        y: y + retrait,
        w: PAS_X - retrait * 2,
        h: PAS_Y - retrait * 2,
        o: 0.3 + alea() * 0.55,
      })
    }
  }
  return blocs
})()

const RUES_V = Array.from({ length: Math.ceil(2680 / PAS_X) }, (_, i) => -520 + i * PAS_X)
const RUES_H = Array.from({ length: Math.ceil(1880 / PAS_Y) }, (_, i) => -420 + i * PAS_Y)

export function CarteDecor() {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className="size-full"
      aria-hidden
      focusable="false"
    >
      <rect x="0" y="0" width="1600" height="1000" className="fill-bg-soft" />

      {/* Trame urbaine, inclinée en bloc : une grille parfaitement droite se lit comme un quadrillage, pas comme une ville. */}
      <g transform="rotate(-9 800 500)">
        {/*
          Les îlots sont peints à l'encre du texte, très diluée, et non avec la
          couleur des filets : celle-ci est calibrée pour un trait de un pixel
          sur fond blanc, et disparaît dès qu'on en fait une surface.
        */}
        <g className="fill-fg" opacity="0.14">
          {BLOCS.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="5" opacity={b.o} />
          ))}
        </g>

        <g className="stroke-bg" strokeLinecap="square">
          {RUES_V.map((x, i) => (
            <line key={`v${i}`} x1={x} y1={-420} x2={x} y2={1460} strokeWidth={i % 4 === 0 ? 13 : 7} />
          ))}
          {RUES_H.map((y, i) => (
            <line key={`h${i}`} x1={-520} y1={y} x2={2160} y2={y} strokeWidth={i % 5 === 0 ? 13 : 7} />
          ))}
        </g>
      </g>

      {/* Parc et plan d'eau : deux respirations qui cassent la régularité de la trame. */}
      <path
        d="M980 108c118-26 246 6 292 84 46 78 8 186-74 224-82 38-198 26-256-28-58-54-80-254 38-280z"
        className="fill-action"
        opacity="0.12"
      />
      <path
        d="M196 636c92-54 208-40 258 22 50 62 26 158-46 190-72 32-172 14-214-48-42-62-90-110 2-164z"
        className="fill-action"
        opacity="0.1"
      />

      {/* Rivière, tracée par-dessus la trame : en ville l'eau coupe les rues, jamais l'inverse. */}
      <path
        d="M-60 706C220 664 372 806 620 772S1064 566 1320 600s280 44 340 26"
        className="stroke-geo"
        strokeWidth="62"
        strokeLinecap="round"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M-60 706C220 664 372 806 620 772S1064 566 1320 600s280 44 340 26"
        className="stroke-geo"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.22"
      />
    </svg>
  )
}

/**
 * Marqueur de carte.
 *
 * Bleu et non teal : dans le système de couleur, le bleu situe et le teal
 * appelle un clic. Un marqueur ne demande rien, il indique un endroit.
 */
export function Marqueur({ actif = false }: { actif?: boolean }) {
  return (
    <span className="relative flex size-8 items-center justify-center" aria-hidden>
      {actif && (
        <span className="absolute size-8 animate-ping rounded-full bg-geo/25 [animation-duration:2.8s] motion-reduce:hidden" />
      )}
      <svg viewBox="0 0 24 24" className="relative size-8 drop-shadow-sm" aria-hidden>
        <path
          d="M12 22s-7-6.1-7-11.6a7 7 0 1 1 14 0C19 15.9 12 22 12 22z"
          className="fill-geo"
        />
        <circle cx="12" cy="10.2" r="2.7" className="fill-bg" />
      </svg>
    </span>
  )
}
