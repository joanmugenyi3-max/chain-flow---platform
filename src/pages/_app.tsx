import type { AppProps } from 'next/app';
import { TenantProvider } from '@/core/tenant/TenantProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TenantProvider>
      <Component {...pageProps} />
    </TenantProvider>
  );
}
