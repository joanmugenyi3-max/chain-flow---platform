import React from 'react';
import type { Locale, TranslationDict } from './index';
import { getTranslations, lookup } from './index';

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a dot-notation key with optional variable interpolation */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const defaultDict: TranslationDict = getTranslations('en');

export const LanguageContext = React.createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key, vars) => lookup(defaultDict, key, vars),
});
