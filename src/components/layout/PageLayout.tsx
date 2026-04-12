import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { useTenant } from '@/core/tenant/useTenant';
import { colors, font, radius } from '@/lib/styles';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PLAN_COLORS: Record<string, string> = {
  STARTER: '#64748b',
  PROFESSIONAL: '#7c3aed',
  ENTERPRISE: '#2563eb',
  MINING_ENTERPRISE: '#f97316',
};

export default function PageLayout({ children }: PageLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, plan, tenantName, isLoading } = useTenant();

  const initials = user?.initials ?? 'JO';
  const avatarColor = user?.avatarColor ?? colors.primary;
  const planColor = PLAN_COLORS[plan] ?? colors.slate400;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: font.sans, background: colors.slate50 }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          background: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          padding: '0 28px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          {/* Notification bell */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: colors.slate400, fontSize: 16, padding: '6px',
            borderRadius: 6, display: 'flex', alignItems: 'center',
          }} title="Notifications">
            🔔
          </button>

          {/* Plan badge */}
          {!isLoading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: planColor + '15', color: planColor,
              borderRadius: radius.full, padding: '3px 10px',
              fontSize: 11, fontWeight: 700, fontFamily: font.sans,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: planColor, display: 'inline-block' }} />
              {plan.replace('_', ' ')}
            </div>
          )}

          {/* User avatar */}
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: avatarColor,
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            fontFamily: font.sans,
          }} title={user?.fullName ?? ''}>
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: '28px 32px',
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
