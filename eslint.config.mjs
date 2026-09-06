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
    ".test-build/**",
    // Cloudflare build output. Gitignored, but flat config does not read
    // .gitignore, so without this the generated worker bundle gets linted.
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
