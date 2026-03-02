import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  { ignores: ["node_modules/**", "dist/**", "rollup.config.js", "main.js", "styles.css"] },

  ...obsidianmd.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
    },
    rules: {
      "obsidianmd/ui/sentence-case": ["error", { allowAutoFix: true }],
    },
  },
]);
