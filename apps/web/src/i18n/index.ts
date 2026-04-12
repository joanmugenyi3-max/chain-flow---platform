// ─────────────────────────────────────────────────────────────────────────────
// i18n loader
// Keeps translation files as plain JSON imports so they are bundled at
// build time — no runtime fetch, no external dep.
// ─────────────────────────────────────────────────────────────────────────────

import en from './en.json';
import fr from './fr.json';

export type Locale = 'en' | 'fr';

export const LOCALES: Locale[] = ['en', 'fr'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
};

export type TranslationDict = typeof en; // en.json is the canonical shape

// fr is cast so TypeScript doesn't fail when the two JSON shapes diverge during
// incremental development — lookup() handles missing keys gracefully at runtime.
const TRANSLATIONS: Record<Locale, TranslationDict> = {
  en,
  fr: fr as unknown as TranslationDict,
};

/**
 * Look up a dot-notation key in a translation dict.
 * Supports simple {{placeholder}} interpolation.
 *
 * @example
 *   lookup(dict, 'dashboard.greetingMorning')         // "Good morning"
 *   lookup(dict, 'dashboard.requiresPlan', { plan: 'Professional' })
 */
export function lookup(
  dict: TranslationDict,
  key: string,
  vars?: Record<string, string | number>
): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = dict;
  for (const p of parts) {
    if (node == null || typeof node !== 'object') return key;
    node = node[p];
  }
  if (typeof node !== 'string') return key;
  if (!vars) return node;
  return node.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`
  );
}

export function getTranslations(locale: Locale): TranslationDict {
  return TRANSLATIONS[locale] ?? TRANSLATIONS.en;
}
