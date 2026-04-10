import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { colors, font } from '../../lib/styles';

const NAV_ITEMS = [
  { label: 'Home',        href: '/',           icon: '⌂' },
  { label: 'Analytics',   href: '/analytics',  icon: '📊' },
  { label: 'Procurement', href: '/procurement', icon: '🛒' },
  { label: 'Inventory',   href: '/inventory',  icon: '📦' },
  { label: 'Logistics',   href: '/logistics',  icon: '🚛' },
  { label: 'Mining',      href: '/mining',     icon: '⛏️' },
];

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: font.sans, background: colors.slate50 }}>
      {/* Sidebar */}
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
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: `1px solid ${colors.slate800}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <div>
              <div style={{ color: colors.white, fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
                minechain
              </div>
              <div style={{ color: colors.slate400, fontSize: 11, fontWeight: 500 }}>AI Supply Chain</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.slate400,
              cursor: 'pointer',
              fontSize: 16,
              padding: '4px',
              borderRadius: 4,
              lineHeight: 1,
            }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map((item) => {
            const active = router.pathname === item.href ||
              (item.href !== '/' && router.pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '10px 20px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? colors.primary : 'transparent',
                  color: active ? colors.white : colors.slate400,
                  borderRadius: collapsed ? 0 : '0 8px 8px 0',
                  marginRight: collapsed ? 0 : 8,
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${colors.slate800}`,
          display: collapsed ? 'none' : 'block',
        }}>
          <div style={{ color: colors.slate400, fontSize: 11 }}>v1.0.0 · Enterprise</div>
        </div>
      </aside>

      {/* Main content */}
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
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: colors.primary,
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            JO
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
