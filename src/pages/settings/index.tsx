import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import { useTenant } from '@/core/tenant/useTenant';
import { colors, radius, font } from '@/lib/styles';
import type { PlanTier } from '@/core/module-registry/types';

// ── Plan metadata ─────────────────────────────────────────────────────────────

const PLAN_COLORS: Record<PlanTier, string> = {
  STARTER: '#64748b',
  PROFESSIONAL: '#2563eb',
  ENTERPRISE: '#7c3aed',
  MINING_ENTERPRISE: '#f97316',
};

const PLAN_ICONS: Record<PlanTier, string> = {
  STARTER: '🌱',
  PROFESSIONAL: '⚡',
  ENTERPRISE: '🏢',
  MINING_ENTERPRISE: '⛏️',
};

const PLAN_LABELS: Record<PlanTier, string> = {
  STARTER: 'Starter',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
  MINING_ENTERPRISE: 'Mining Enterprise',
};

// ── Sidebar nav items ─────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'General',      icon: '⚙️',  href: '/settings' },
  { label: 'Subscription', icon: '💳',  href: '/settings/subscription' },
  { label: 'Modules',      icon: '📦',  href: '/settings/modules' },
  { label: 'Team',         icon: '👥',  href: '/settings/team' },
  { label: 'Security',     icon: '🔒',  href: '/settings/security' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: '24px 28px',
      boxShadow: colors.shadow,
      marginBottom: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    }}>
      <h2 style={{
        margin: 0,
        fontSize: 16,
        fontWeight: 700,
        color: colors.slate900,
        fontFamily: font.sans,
        letterSpacing: '-0.3px',
      }}>
        {children}
      </h2>
      {action}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans, fontWeight: 500 }}>
        {label}
      </span>
      <span style={{
        fontSize: 14,
        color: colors.slate800,
        fontFamily: font.sans,
        background: colors.slate50,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        padding: '6px 12px',
        maxWidth: 340,
      }}>
        {value}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsIndexPage() {
  const { tenantName, plan } = useTenant();

  const planColor = PLAN_COLORS[plan] ?? colors.slate400;
  const planIcon = PLAN_ICONS[plan] ?? '⚙️';
  const planLabel = PLAN_LABELS[plan] ?? plan;

  return (
    <PageLayout>
      <PageHeader
        title="Settings"
        description="Manage your organization preferences and account configuration."
        icon="⚙️"
      />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left sidebar nav ────────────────────────────────────────────── */}
        <nav style={{
          width: 200,
          flexShrink: 0,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          boxShadow: colors.shadow,
          padding: '8px 0',
          position: 'sticky',
          top: 80,
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/settings';
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  margin: '2px 8px',
                  borderRadius: radius.md,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: font.sans,
                  color: isActive ? colors.white : colors.slate700,
                  background: isActive ? colors.primary : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right content area ───────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* 1. Organization */}
          <SectionCard>
            <SectionTitle
              action={
                <button
                  onClick={() => {}}
                  style={{
                    background: 'transparent',
                    color: colors.slate600,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: font.sans,
                  }}
                >
                  Edit
                </button>
              }
            >
              Organization
            </SectionTitle>

            <div>
              <FieldRow label="Organization Name" value={tenantName} />
              <FieldRow label="Industry"           value="Mining" />
              <FieldRow label="Currency"           value="USD" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                alignItems: 'center',
                padding: '10px 0',
              }}>
                <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans, fontWeight: 500 }}>
                  Timezone
                </span>
                <span style={{
                  fontSize: 14,
                  color: colors.slate800,
                  fontFamily: font.sans,
                  background: colors.slate50,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.sm,
                  padding: '6px 12px',
                  maxWidth: 340,
                }}>
                  UTC+2 · Africa/Kampala
                </span>
              </div>
            </div>
          </SectionCard>

          {/* 2. Current Plan */}
          <SectionCard>
            <SectionTitle>Current Plan</SectionTitle>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '20px 24px',
              background: planColor + '0d',
              border: `2px solid ${planColor}40`,
              borderRadius: radius.lg,
              marginBottom: 20,
            }}>
              {/* Plan icon circle */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: radius.lg,
                background: planColor + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
              }}>
                {planIcon}
              </div>

              {/* Plan info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: planColor,
                    fontFamily: font.sans,
                    letterSpacing: '-0.3px',
                  }}>
                    {planLabel}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.success,
                    background: colors.successLight,
                    border: `1px solid ${colors.successBorder}`,
                    borderRadius: radius.full,
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: font.sans,
                  }}>
                    Active
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                    💳 Monthly billing
                  </span>
                  <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                    🔄 Next renewal: May 11, 2026
                  </span>
                </div>
              </div>

              {/* Manage link */}
              <Link
                href="/settings/subscription"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: planColor,
                  color: colors.white,
                  borderRadius: radius.md,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: font.sans,
                  flexShrink: 0,
                }}
              >
                Manage Subscription →
              </Link>
            </div>
          </SectionCard>

          {/* 3. Danger Zone */}
          <div style={{
            background: colors.dangerLight,
            border: `1.5px solid ${colors.dangerBorder}`,
            borderRadius: radius.lg,
            padding: '24px 28px',
            boxShadow: colors.shadow,
          }}>
            <SectionTitle>Danger Zone</SectionTitle>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.slate800, fontFamily: font.sans, marginBottom: 2 }}>
                  Reset Demo Data
                </div>
                <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                  Restore all sample data to its original demo state.
                </div>
              </div>
              <button
                onClick={() => alert('Demo data reset.')}
                style={{
                  background: 'transparent',
                  color: colors.warning,
                  border: `1.5px solid ${colors.warning}`,
                  borderRadius: radius.md,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: font.sans,
                  flexShrink: 0,
                }}
              >
                Reset Demo Data
              </button>
            </div>

            <div style={{ height: 1, background: colors.dangerBorder, margin: '18px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.slate800, fontFamily: font.sans, marginBottom: 2 }}>
                  Delete Account
                </div>
                <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                  Permanently remove your organization and all associated data.
                </div>
              </div>
              <button
                onClick={() => alert('Contact support@minechain.ai')}
                style={{
                  background: 'transparent',
                  color: colors.danger,
                  border: 'none',
                  padding: '8px 4px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: font.sans,
                  textDecoration: 'underline',
                  flexShrink: 0,
                }}
              >
                Request Account Deletion
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
