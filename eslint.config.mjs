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
    // Code installé depuis des registres de composants (shadcn, matos-ui).
    // Il n'est pas écrit ici et ne doit pas être modifié : le corriger pour
    // satisfaire nos règles rendrait chaque mise à jour douloureuse.
    "src/components/ui/**",
    "src/components/matos-ui/**",
    "src/components/motion-primitives/**",
    "src/lib/motion-tokens.ts",
    "src/lib/surface-classes.ts",
    "src/lib/surface-context.tsx",
  ]),
]);

export default eslintConfig;
