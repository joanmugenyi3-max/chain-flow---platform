import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTenant } from '@/core/tenant/useTenant';
import { useTranslation } from '@/i18n/useTranslation';
import { LOCALE_LABELS, LOCALES } from '@/i18n/index';
import { colors, font } from '@/lib/styles';
import type { ModuleManifest } from '@/core/module-registry/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const PLAN_COLORS: Record<string, string> = {
  STARTER:           '#64748b',
  PROFESSIONAL:      '#7c3aed',
  ENTERPRISE:        '#2563eb',
  MINING_ENTERPRISE: '#f97316',
};

function NavItem({
  href, icon, label, collapsed, active,
}: {
  href: string; icon: string; label: string; collapsed: boolean; active: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        title={collapsed ? label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '10px 0' : '10px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: active ? colors.primary : 'transparent',
          color: active ? colors.white : colors.slate400,
          borderRadius: '0 8px 8px 0',
          marginRight: collapsed ? 0 : 8,
          fontWeight: active ? 600 : 400,
          fontSize: 13,
          fontFamily: font.sans,
          transition: 'background 0.15s, color 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!active) (e.currentTarget as HTMLDivElement).style.background = colors.slate800;
        }}
        onMouseLeave={(e) => {
          if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
        {!collapsed && (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const { enabledModules, plan, tenantName, isLoading } = useTenant();
  const { t, locale, setLocale } = useTranslation();

  const sortedModules: ModuleManifest[] = [...enabledModules].sort(
    (a, b) => a.navOrder - b.navOrder
  );

  const isActive = (href: string) =>
    router.pathname === href || (href !== '/' && router.pathname.startsWith(href));

  const BOTTOM_NAV = [
    { id: 'workflows',   href: '/workflows',   icon: '⚡', label: t('nav.workflows')   },
    { id: 'marketplace', href: '/marketplace', icon: '🏪', label: t('nav.marketplace') },
    { id: 'settings',    href: '/settings',    icon: '⚙️',  label: t('nav.settings')    },
  ];

  const planLabel = t(`plans.${plan}` as Parameters<typeof t>[0]) || plan;
  const planColor = PLAN_COLORS[plan] ?? '#64748b';

  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      background: colors.slate900,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* ── Logo + toggle ───────────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: `1px solid ${colors.slate800}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
      }}>
        {!collapsed && (
          <div>
            <div style={{ color: colors.white, fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px', fontFamily: font.sans }}>
              {t('brand.name')}
            </div>
            <div style={{ color: colors.slate400, fontSize: 10, fontWeight: 500, fontFamily: font.sans }}>
              {t('brand.tagline')}
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'none', border: 'none',
            color: colors.slate400, cursor: 'pointer',
            fontSize: 14, padding: '4px', borderRadius: 4, lineHeight: 1,
          }}
          title={collapsed ? t('brand.expandSidebar') : t('brand.collapseSidebar')}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* ── Home link ───────────────────────────────────────────────────── */}
      <div style={{ padding: '8px 0 4px' }}>
        <NavItem
          href="/"
          icon="⌂"
          label={t('nav.home')}
          collapsed={collapsed}
          active={router.pathname === '/'}
        />
      </div>

      {/* ── Module nav ──────────────────────────────────────────────────── */}
      {!isLoading && sortedModules.length > 0 && (
        <>
          {!collapsed && (
            <div style={{
              padding: '8px 16px 4px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              color: colors.slate600, textTransform: 'uppercase', fontFamily: font.sans,
            }}>
              {t('nav.modules')}
            </div>
          )}
          <nav style={{ padding: '0 0 4px' }}>
            {sortedModules.map((mod) => {
              // Derive translation key from module id; fall back to registry value
              const nameKey = `modules.${mod.id}.name`;
              const translated = t(nameKey);
              const label = translated !== nameKey ? translated : mod.name;
              return (
                <NavItem
                  key={mod.id}
                  href={mod.href}
                  icon={mod.icon}
                  label={label}
                  collapsed={collapsed}
                  active={isActive(mod.href)}
                />
              );
            })}
          </nav>
        </>
      )}

      {/* ── Loading skeleton ────────────────────────────────────────────── */}
      {isLoading && !collapsed && (
        <div style={{ padding: '12px 16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              height: 32, background: colors.slate800,
              borderRadius: 6, marginBottom: 6,
            }} />
          ))}
        </div>
      )}

      {/* ── Spacer ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Bottom nav (Workflows, Marketplace, Settings) ───────────────── */}
      {!collapsed && (
        <div style={{
          padding: '8px 0 0 16px',
          borderTop: `1px solid ${colors.slate800}`,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: colors.slate600, textTransform: 'uppercase', fontFamily: font.sans,
        }}>
          {t('nav.platform')}
        </div>
      )}
      {collapsed && (
        <div style={{ borderTop: `1px solid ${colors.slate800}`, marginBottom: 4 }} />
      )}
      <nav style={{ padding: '0 0 4px' }}>
        {BOTTOM_NAV.map((item) => (
          <NavItem
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            active={isActive(item.href)}
          />
        ))}
      </nav>

      {/* ── Language switcher ────────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? '10px 0' : '10px 16px',
        borderTop: `1px solid ${colors.slate800}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 6,
      }}>
        {LOCALES.map((loc, i) => (
          <React.Fragment key={loc}>
            {i > 0 && !collapsed && (
              <span style={{ color: colors.slate700, fontSize: 11, userSelect: 'none' }}>|</span>
            )}
            <button
              onClick={() => setLocale(loc)}
              title={LOCALE_LABELS[loc]}
              style={{
                background: 'none',
                border: 'none',
                padding: collapsed ? '2px 0' : '2px 4px',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: locale === loc ? 700 : 400,
                fontFamily: font.sans,
                color: locale === loc ? colors.white : colors.slate500,
                borderRadius: 3,
                transition: 'color 0.12s',
                letterSpacing: '0.05em',
              }}
            >
              {LOCALE_LABELS[loc]}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* ── Plan badge ──────────────────────────────────────────────────── */}
      {!collapsed && (
        <div style={{
          padding: '10px 16px 14px',
          borderTop: `1px solid ${colors.slate800}`,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: planColor + '22',
            color: planColor,
            borderRadius: 999, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, fontFamily: font.sans,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: planColor, display: 'inline-block',
            }} />
            {planLabel}
          </div>
          <div style={{
            color: colors.slate600, fontSize: 10, marginTop: 4,
            fontFamily: font.sans, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tenantName}
          </div>
        </div>
      )}
    </aside>
  );
}
