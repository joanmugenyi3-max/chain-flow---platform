import type { AppProps } from 'next/app';
import { TenantProvider } from '@/core/tenant/TenantProvider';
import { LanguageProvider } from '@/i18n/LanguageProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TenantProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </TenantProvider>
  );
}
