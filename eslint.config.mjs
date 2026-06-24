import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "releases/**"],
  },
  js.configs.recommended,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "types/**/*.d.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        chrome: "readonly",
        browser: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "prefer-rest-params": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
