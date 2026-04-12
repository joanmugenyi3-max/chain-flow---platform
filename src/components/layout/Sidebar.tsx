import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTenant } from '@/core/tenant/useTenant';
import { colors, font } from '@/lib/styles';
import type { ModuleManifest } from '@/core/module-registry/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const BOTTOM_NAV = [
  { id: 'workflows',   href: '/workflows',   icon: '⚡', label: 'Workflows' },
  { id: 'marketplace', href: '/marketplace', icon: '🏪', label: 'Marketplace' },
  { id: 'settings',    href: '/settings',    icon: '⚙️',  label: 'Settings' },
];

const PLAN_COLORS: Record<string, string> = {
  STARTER:           '#64748b',
  PROFESSIONAL:      '#7c3aed',
  ENTERPRISE:        '#2563eb',
  MINING_ENTERPRISE: '#f97316',
};

const PLAN_LABELS: Record<string, string> = {
  STARTER:           'Starter',
  PROFESSIONAL:      'Professional',
  ENTERPRISE:        'Enterprise',
  MINING_ENTERPRISE: 'Mining Enterprise',
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
        {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
      </div>
    </Link>
  );
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const { enabledModules, plan, tenantName, isLoading } = useTenant();

  const sortedModules: ModuleManifest[] = [...enabledModules].sort(
    (a, b) => a.navOrder - b.navOrder
  );

  const isActive = (href: string) =>
    router.pathname === href || (href !== '/' && router.pathname.startsWith(href));

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
      {/* Logo + toggle */}
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
              minechain
            </div>
            <div style={{ color: colors.slate400, fontSize: 10, fontWeight: 500, fontFamily: font.sans }}>
              AI Supply Chain
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
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Home link */}
      <div style={{ padding: '8px 0 4px' }}>
        <NavItem href="/" icon="⌂" label="Home" collapsed={collapsed} active={router.pathname === '/'} />
      </div>

      {/* Module nav */}
      {!isLoading && sortedModules.length > 0 && (
        <>
          {!collapsed && (
            <div style={{
              padding: '8px 16px 4px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              color: colors.slate600, textTransform: 'uppercase', fontFamily: font.sans,
            }}>
              Modules
            </div>
          )}
          <nav style={{ padding: '0 0 4px' }}>
            {sortedModules.map((mod) => (
              <NavItem
                key={mod.id}
                href={mod.href}
                icon={mod.icon}
                label={mod.name}
                collapsed={collapsed}
                active={isActive(mod.href)}
              />
            ))}
          </nav>
        </>
      )}

      {/* Loading skeleton */}
      {isLoading && !collapsed && (
        <div style={{ padding: '12px 16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              height: 32, background: colors.slate800,
              borderRadius: 6, marginBottom: 6,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom nav (always visible) */}
      {!collapsed && (
        <div style={{
          padding: '4px 0 0',
          borderTop: `1px solid ${colors.slate800}`,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: colors.slate600, textTransform: 'uppercase', fontFamily: font.sans,
          paddingTop: 8, paddingLeft: 16,
        }}>
          Platform
        </div>
      )}
      {collapsed && <div style={{ borderTop: `1px solid ${colors.slate800}`, marginBottom: 4 }} />}
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

      {/* Plan badge */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${colors.slate800}`,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: (PLAN_COLORS[plan] ?? '#64748b') + '22',
            color: PLAN_COLORS[plan] ?? '#64748b',
            borderRadius: 999, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, fontFamily: font.sans,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLAN_COLORS[plan] ?? '#64748b', display: 'inline-block' }} />
            {PLAN_LABELS[plan] ?? plan}
          </div>
          <div style={{ color: colors.slate600, fontSize: 10, marginTop: 4, fontFamily: font.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tenantName}
          </div>
        </div>
      )}
    </aside>
  );
}
