import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Fichiers produits par graphql-codegen, jamais édités à la main.
    "src/lib/wp/generated/**",
    // Worker MapLibre copié depuis node_modules par
    // `scripts/copie-worker-maplibre.mjs` : du code minifié d'une dépendance,
    // servi tel quel, qui n'a rien à faire dans le périmètre du lint.
    "public/maplibre/**",
    // Code installé depuis des registres de composants (shadcn, matos-ui).
    // Il n'est pas écrit ici et ne doit pas être modifié : le corriger pour
    // satisfaire nos règles rendrait chaque mise à jour douloureuse.
    "src/components/ui/**",
    "src/components/matos-ui/**",
    "src/components/motion-primitives/**",
    // Blocks shadcnblocks installés par `pnpm dlx shadcn add @shadcnblocks/…`,
    // laissés là où le CLI les pose. Seuls leur contenu et leurs jetons
    // changent, pas leur structure : les règles de lint ne s'y appliquent pas.
    "src/components/hero140.tsx",
    "src/components/kibo-ui/**",
    "src/components/stats9.tsx",
    "src/components/feature287.tsx",
    "src/components/process2.tsx",
    "src/components/cta18.tsx",
    "src/components/blog31.tsx",
    "src/components/cta42.tsx",
    "src/components/faq17.tsx",
    "src/components/book-a-demo2.tsx",
    "src/lib/motion-tokens.ts",
    "src/lib/surface-classes.ts",
    "src/lib/surface-context.tsx",
  ]),
]);

export default eslintConfig;
