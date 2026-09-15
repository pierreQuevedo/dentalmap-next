# motion-primitives

Composants repris de [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives),
sous licence MIT, à la version du 15 septembre 2026.

Le site de la bibliothèque est protégé par un challenge Vercel : le registre
shadcn n'est pas joignable en ligne de commande, les fichiers ont donc été
repris depuis `components/core` du dépôt.

Seule modification : les imports `motion/react` deviennent `framer-motion`.
C'est la même API sous un autre nom de paquet, et le site anime déjà avec
framer-motion ; tirer les deux doublerait la bibliothèque dans le bundle.

Ces fichiers sont du code tiers : ils sont exclus du lint, comme
`components/ui` et `components/matos-ui`.

## Adaptations

- `scroll-progress` : l'option `layoutEffect` de `useScroll` a disparu en
  framer-motion 13, elle est retirée.
- `disclosure` : `element.props` est `unknown` avec les types React 19, le
  `cloneElement` est typé. Le comportement, lui, est inchangé, y compris le
  fait que les props de l'enfant écrasent celles injectées : ne pas passer de
  `className` à `DisclosureTrigger`, il serait perdu.
- `scroll-progress` : `containerRef` accepte `RefObject<HTMLDivElement | null>`,
  type que rend `useRef(null)` depuis React 19.
- `morphing-dialog` : `MorphingDialogTrigger` accepte un `aria-label`. Sans lui
  le déclencheur s'annonce « Open dialog <identifiant> », en anglais et sans
  information, sur un site français.
