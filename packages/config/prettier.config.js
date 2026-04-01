// packages/config/prettier.config.js
// Shared Prettier configuration for the entire ChainFlow monorepo.

'use strict';

/** @type {import('prettier').Config} */
module.exports = {
  // ── Core formatting ────────────────────────────────────────
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // ── End of line ────────────────────────────────────────────
  endOfLine: 'lf',

  // ── Embedded language formatting ──────────────────────────
  embeddedLanguageFormatting: 'auto',

  // ── HTML / Prose ───────────────────────────────────────────
  htmlWhitespaceSensitivity: 'css',
  proseWrap: 'preserve',
  vueIndentScriptAndStyle: false,

  // ── Per-language overrides ─────────────────────────────────
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 120,
        trailingComma: 'none',
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 80,
        proseWrap: 'always',
        singleQuote: false,
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        singleQuote: false,
        tabWidth: 2,
      },
    },
    {
      files: ['*.sql'],
      options: {
        keywordCase: 'upper',
      },
    },
    {
      files: ['*.tsx', '*.jsx'],
      options: {
        jsxSingleQuote: false,
        printWidth: 100,
      },
    },
    {
      files: ['*.graphql', '*.gql'],
      options: {
        printWidth: 80,
      },
    },
  ],
};
