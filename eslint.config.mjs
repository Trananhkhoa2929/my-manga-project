import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * ESLint Configuration with FSD Boundaries
 * 
 * Feature-Sliced Design Layer Rules:
 * - shared: Can only import from shared
 * - entities: Can import from shared, entities
 * - features: Can import from shared, entities, features
 * - widgets: Can import from shared, entities, features, widgets
 * - pages: Can import from all layers
 * - app: Can import from all layers
 */

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // FSD Boundaries Configuration
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "shared", pattern: "src/shared/*" },
        { type: "entities", pattern: "src/entities/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "widgets", pattern: "src/widgets/*" },
        { type: "pages", pattern: "src/app/*" },
        // Legacy components (will be migrated)
        { type: "components", pattern: "src/components/*" },
        { type: "lib", pattern: "src/lib/*" },
        { type: "hooks", pattern: "src/hooks/*" },
      ],
      "boundaries/ignore": [
        // Ignore test files
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
    rules: {
      // FSD Layer Rules
      "boundaries/element-types": [
        "warn", // Use "warn" during migration, change to "error" later
        {
          default: "disallow",
          rules: [
            // Shared layer - can only import from shared
            {
              from: "shared",
              allow: ["shared"],
            },
            // Entities layer - can import from shared, other entities
            {
              from: "entities",
              allow: ["shared", "entities"],
            },
            // Features layer - can import from shared, entities, other features
            {
              from: "features",
              allow: ["shared", "entities", "features"],
            },
            // Widgets layer - can import from shared, entities, features, other widgets
            {
              from: "widgets",
              allow: ["shared", "entities", "features", "widgets"],
            },
            // Pages (app/) - can import from all FSD layers
            {
              from: "pages",
              allow: ["shared", "entities", "features", "widgets", "pages", "components", "lib", "hooks"],
            },
            // Legacy: components, lib, hooks can import anything during migration
            {
              from: "components",
              allow: ["shared", "entities", "features", "widgets", "components", "lib", "hooks"],
            },
            {
              from: "lib",
              allow: ["shared", "lib"],
            },
            {
              from: "hooks",
              allow: ["shared", "entities", "lib", "hooks"],
            },
          ],
        },
      ],
      // Prevent circular dependencies
      "boundaries/no-private": ["warn", { allowUncles: false }],
    },
  },

  // Override default ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
