import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import importSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['node_modules']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, prettier, 'simple-import-sort': importSort },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
