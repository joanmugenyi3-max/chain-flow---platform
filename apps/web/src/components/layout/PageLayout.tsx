import React, { useState } from 'react';
import { colors, font } from '../../lib/styles';
import { useTenant } from '@/core/tenant/useTenant';
import { useTranslation } from '@/i18n/useTranslation';
import { LOCALE_LABELS, LOCALES } from '@/i18n/index';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading } = useTenant();
  const { locale, setLocale } = useTranslation();

  const initials = user?.initials   ?? 'JO';
  const avatarBg = user?.avatarColor ?? colors.primary;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: font.sans, background: colors.slate50 }}>

      {/* ── Dynamic sidebar ─────────────────────────────────────────────── */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>

          {/* ── Language switcher (header duplicate — visible when sidebar collapsed) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {LOCALES.map((loc, i) => (
              <React.Fragment key={loc}>
                {i > 0 && (
                  <span style={{
                    color: colors.slate300,
                    fontSize: 12,
                    userSelect: 'none',
                    padding: '0 1px',
                  }}>
                    |
                  </span>
                )}
                <button
                  onClick={() => setLocale(loc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '3px 6px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: locale === loc ? 700 : 400,
                    fontFamily: font.sans,
                    color: locale === loc ? colors.slate900 : colors.slate400,
                    borderRadius: 4,
                    transition: 'color 0.12s',
                    letterSpacing: '0.05em',
                  }}
                >
                  {LOCALE_LABELS[loc]}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* User avatar */}
          <div
            title={isLoading ? 'Loading…' : user?.fullName}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: avatarBg,
              color: colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: font.sans,
              transition: 'opacity 0.2s',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: '32px',
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}>
          {children}
        </main>

      </div>
    </div>
  );
}
