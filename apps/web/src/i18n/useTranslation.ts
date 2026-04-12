import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import type { LanguageContextValue } from './LanguageContext';

/**
 * Primary hook for consuming translations.
 *
 * @example
 *   const { t, locale, setLocale } = useTranslation();
 *   t('nav.home')                               // "Home" | "Accueil"
 *   t('dashboard.requiresPlan', { plan: 'Pro' }) // "Requires Pro plan"
 */
export function useTranslation(): LanguageContextValue {
  return useContext(LanguageContext);
}
