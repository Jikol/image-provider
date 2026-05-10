import eslint from "@eslint/js";
import eslintPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist", "**/node_modules", "**/_src"]),
  {
    files: ["**/*.ts"],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, eslintPrettier],
    plugins: {
      import: importPlugin,
      "@typescript-eslint": tseslint.plugin
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true
      },
      globals: {
        ...globals.node
      },
      ecmaVersion: "latest",
      sourceType: "module"
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true
      }
    },
    rules: {
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "always",
          js: "always",
          json: "always"
        }
      ],
      "linebreak-style": ["error", "unix"],
      "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true
        }
      ],
      "no-undef": "off",
      "newline-after-var": "error",
      "newline-before-return": "error",
      "no-trailing-spaces": "error",
      "prefer-const": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-unused-vars": "error"
    }
  }
]);
