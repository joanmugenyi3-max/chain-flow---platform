import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LanguageContext } from './LanguageContext';
import type { Locale } from './index';
import { getTranslations, lookup, LOCALES } from './index';
import { useTenant } from '../core/tenant/useTenant';

const DEFAULT_LOCALE: Locale = 'en';

/**
 * Detect the browser's preferred language as a fallback.
 * Only called client-side when the tenant has no stored language preference.
 */
function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return (LOCALES as string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language: tenantLanguage, setLanguage: setTenantLanguage, isLoading } = useTenant();

  // Start with default; will sync from tenant once context loads
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  // Sync locale from tenant context once the tenant has finished loading
  useEffect(() => {
    if (isLoading) return;

    if (tenantLanguage && (LOCALES as string[]).includes(tenantLanguage)) {
      // Tenant has a stored language preference — use it
      setLocaleState(tenantLanguage);
    } else {
      // No tenant preference — fall back to browser language
      setLocaleState(getBrowserLocale());
    }
    setHydrated(true);
  }, [isLoading, tenantLanguage]);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    // Persist preference back to tenant (fire-and-forget; errors are logged in TenantProvider)
    await setTenantLanguage(next);
  }, [setTenantLanguage]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      lookup(getTranslations(locale), key, vars),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  // Render with default locale on first paint to avoid SSR mismatch,
  // then immediately sync to the correct locale after hydration.
  // This is intentionally not a loading gate — one frame of default locale
  // is acceptable and avoids a blank-screen flash.
  void hydrated; // used to trigger re-render after hydration

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
