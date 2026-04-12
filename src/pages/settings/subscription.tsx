import React from 'react';
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

const PLAN_PRICES: Record<PlanTier, number> = {
  STARTER: 299,
  PROFESSIONAL: 799,
  ENTERPRISE: 1999,
  MINING_ENTERPRISE: 4999,
};

const PLAN_DESCRIPTIONS: Record<PlanTier, string> = {
  STARTER: 'Essential tools for small mining operations.',
  PROFESSIONAL: 'Advanced features for growing operations with logistics support.',
  ENTERPRISE: 'Full-suite ERP with custom reporting and unlimited users.',
  MINING_ENTERPRISE: 'Industry-leading platform with IoT telemetry and ESG reporting.',
};

// Comparison table data
type PlanRow = {
  label: string;
  STARTER: string;
  PROFESSIONAL: string;
  ENTERPRISE: string;
  MINING_ENTERPRISE: string;
};

const PLAN_TABLE_ROWS: PlanRow[] = [
  {
    label: 'Price/mo',
    STARTER: '$299',
    PROFESSIONAL: '$799',
    ENTERPRISE: '$1,999',
    MINING_ENTERPRISE: '$4,999',
  },
  {
    label: 'Modules included',
    STARTER: '3 modules',
    PROFESSIONAL: '4 modules',
    ENTERPRISE: '4 modules',
    MINING_ENTERPRISE: '5 modules',
  },
  {
    label: 'Max users',
    STARTER: '5 users',
    PROFESSIONAL: '25 users',
    ENTERPRISE: 'Unlimited',
    MINING_ENTERPRISE: 'Unlimited',
  },
  {
    label: 'API calls/day',
    STARTER: '10K',
    PROFESSIONAL: '100K',
    ENTERPRISE: '1M',
    MINING_ENTERPRISE: '10M',
  },
  {
    label: 'SLA',
    STARTER: '99.5%',
    PROFESSIONAL: '99.9%',
    ENTERPRISE: '99.95%',
    MINING_ENTERPRISE: '99.99%',
  },
  {
    label: 'AI Insights',
    STARTER: '✗',
    PROFESSIONAL: '✓',
    ENTERPRISE: '✓',
    MINING_ENTERPRISE: '✓',
  },
  {
    label: 'Custom Reports',
    STARTER: '✗',
    PROFESSIONAL: '✗',
    ENTERPRISE: '✓',
    MINING_ENTERPRISE: '✓',
  },
];

const ALL_PLANS: PlanTier[] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'];

// ── Billing history rows ──────────────────────────────────────────────────────

const BILLING_HISTORY = [
  { period: 'Apr 2026', amount: '$4,999', status: 'Paid' },
  { period: 'Mar 2026', amount: '$4,999', status: 'Paid' },
  { period: 'Feb 2026', amount: '$4,999', status: 'Paid' },
  { period: 'Jan 2026', amount: '$4,999', status: 'Paid' },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const { plan } = useTenant();

  const planColor = PLAN_COLORS[plan] ?? colors.slate400;
  const planIcon = PLAN_ICONS[plan] ?? '⚙️';
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const planPrice = PLAN_PRICES[plan] ?? 0;
  const planDescription = PLAN_DESCRIPTIONS[plan] ?? '';

  // Add-on active state based on plan
  const logisticsActive =
    plan === 'PROFESSIONAL' || plan === 'ENTERPRISE' || plan === 'MINING_ENTERPRISE';
  const miningActive = plan === 'MINING_ENTERPRISE';

  return (
    <PageLayout>
      <PageHeader
        title="Subscription"
        description="Manage your plan and billing."
        icon="💳"
        accentColor={planColor}
      />

      {/* ── 1. Current Plan Card ──────────────────────────────────────────── */}
      <div style={{
        background: colors.white,
        border: `2px solid ${planColor}`,
        borderRadius: radius.xl,
        padding: '28px 32px',
        boxShadow: colors.shadowMd,
        marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Icon */}
            <div style={{
              width: 60,
              height: 60,
              borderRadius: radius.lg,
              background: planColor + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0,
            }}>
              {planIcon}
            </div>

            {/* Plan name + description */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: planColor,
                  fontFamily: font.sans,
                  letterSpacing: '-0.4px',
                }}>
                  {planLabel}
                </span>
                {/* Active badge */}
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.success,
                  background: colors.successLight,
                  border: `1px solid ${colors.successBorder}`,
                  borderRadius: radius.full,
                  padding: '2px 9px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px',
                  fontFamily: font.sans,
                }}>
                  Active
                </span>
                {/* Plan badge */}
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: planColor,
                  background: planColor + '15',
                  border: `1px solid ${planColor}40`,
                  borderRadius: radius.full,
                  padding: '2px 9px',
                  fontFamily: font.sans,
                }}>
                  {plan.replace('_', ' ')}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: colors.slate500, fontFamily: font.sans }}>
                {planDescription}
              </p>
            </div>
          </div>

          {/* Price block */}
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: colors.slate900, fontFamily: font.sans, letterSpacing: '-1px', lineHeight: 1 }}>
              ${planPrice.toLocaleString()}
              <span style={{ fontSize: 15, fontWeight: 500, color: colors.slate400 }}>/mo</span>
            </div>
          </div>
        </div>

        {/* Billing info bar */}
        <div style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap' as const,
        }}>
          <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
            🗓 Next billing: <strong style={{ color: colors.slate700 }}>May 11, 2026</strong>
          </span>
          <span style={{ color: colors.slate300 }}>·</span>
          <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>Monthly</span>
          <span style={{ color: colors.slate300 }}>·</span>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.success,
            background: colors.successLight,
            border: `1px solid ${colors.successBorder}`,
            borderRadius: radius.full,
            padding: '2px 8px',
            fontFamily: font.sans,
          }}>
            Auto-renew ON
          </span>
        </div>
      </div>

      {/* ── 2. Plan Comparison Table ──────────────────────────────────────── */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        boxShadow: colors.shadowMd,
        marginBottom: 28,
        overflow: 'hidden',
      }}>
        {/* Table header row */}
        <div style={{ padding: '20px 28px 0', borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>
            Plan Comparison
          </h3>
        </div>

        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, minWidth: 640 }}>
            <thead>
              <tr>
                {/* Feature label column */}
                <th style={{
                  padding: '14px 28px',
                  textAlign: 'left' as const,
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.slate500,
                  fontFamily: font.sans,
                  background: colors.slate50,
                  borderBottom: `1px solid ${colors.border}`,
                  width: 180,
                }}>
                  Feature
                </th>
                {ALL_PLANS.map((p) => {
                  const isCurrent = p === plan;
                  const col = PLAN_COLORS[p];
                  return (
                    <th key={p} style={{
                      padding: '14px 20px',
                      textAlign: 'center' as const,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: font.sans,
                      color: isCurrent ? colors.white : colors.slate700,
                      background: isCurrent ? col : colors.slate50,
                      borderBottom: `1px solid ${colors.border}`,
                      borderLeft: `1px solid ${colors.border}`,
                    }}>
                      <div style={{ fontSize: 17, marginBottom: 2 }}>{PLAN_ICONS[p]}</div>
                      {PLAN_LABELS[p]}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PLAN_TABLE_ROWS.map((row, ri) => (
                <tr key={row.label} style={{ background: ri % 2 === 0 ? colors.white : colors.slate50 }}>
                  <td style={{
                    padding: '12px 28px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: colors.slate600,
                    fontFamily: font.sans,
                    borderBottom: `1px solid ${colors.border}`,
                  }}>
                    {row.label}
                  </td>
                  {ALL_PLANS.map((p) => {
                    const isCurrent = p === plan;
                    const cellVal = row[p];
                    const isCheck = cellVal === '✓';
                    const isCross = cellVal === '✗';
                    return (
                      <td key={p} style={{
                        padding: '12px 20px',
                        textAlign: 'center' as const,
                        fontSize: 13,
                        fontWeight: isCurrent ? 600 : 400,
                        color: isCross
                          ? colors.slate300
                          : isCheck
                          ? colors.success
                          : isCurrent
                          ? colors.slate900
                          : colors.slate600,
                        fontFamily: font.sans,
                        borderBottom: `1px solid ${colors.border}`,
                        borderLeft: `1px solid ${colors.border}`,
                        background: isCurrent ? PLAN_COLORS[p] + '08' : 'transparent',
                      }}>
                        {cellVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Upgrade / Current row */}
              <tr>
                <td style={{ padding: '16px 28px', borderTop: `1px solid ${colors.border}` }} />
                {ALL_PLANS.map((p) => {
                  const isCurrent = p === plan;
                  const col = PLAN_COLORS[p];
                  return (
                    <td key={p} style={{
                      padding: '16px 20px',
                      textAlign: 'center' as const,
                      borderTop: `1px solid ${colors.border}`,
                      borderLeft: `1px solid ${colors.border}`,
                    }}>
                      {isCurrent ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '7px 18px',
                          borderRadius: radius.md,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: font.sans,
                          color: col,
                          background: col + '15',
                          border: `1.5px solid ${col}40`,
                        }}>
                          Current Plan
                        </span>
                      ) : (
                        <button
                          onClick={() => alert('Contact sales@minechain.ai to upgrade.')}
                          style={{
                            padding: '7px 18px',
                            borderRadius: radius.md,
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: font.sans,
                            color: colors.white,
                            background: col,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Upgrade
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Add-ons ────────────────────────────────────────────────────── */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        padding: '24px 28px',
        boxShadow: colors.shadowMd,
        marginBottom: 28,
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>
          Add-ons
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Logistics Module */}
          <div style={{
            border: `1.5px solid ${logisticsActive ? colors.infoBorder : colors.border}`,
            borderRadius: radius.lg,
            padding: '18px 20px',
            background: logisticsActive ? colors.infoLight : colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: radius.md,
                background: colors.info + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                🚛
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.slate800, fontFamily: font.sans, marginBottom: 2 }}>
                  Logistics Module
                </div>
                <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                  $149/mo · Shipment tracking &amp; fleet
                </div>
              </div>
            </div>
            {logisticsActive ? (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.success,
                background: colors.successLight,
                border: `1px solid ${colors.successBorder}`,
                borderRadius: radius.full,
                padding: '3px 10px',
                fontFamily: font.sans,
                flexShrink: 0,
              }}>
                Active
              </span>
            ) : (
              <button
                onClick={() => alert('Contact sales@minechain.ai to upgrade.')}
                style={{
                  padding: '6px 14px',
                  borderRadius: radius.md,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: font.sans,
                  color: colors.info,
                  background: 'transparent',
                  border: `1.5px solid ${colors.info}`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Add
              </button>
            )}
          </div>

          {/* Mining Module */}
          <div style={{
            border: `1.5px solid ${miningActive ? colors.miningBorder : colors.border}`,
            borderRadius: radius.lg,
            padding: '18px 20px',
            background: miningActive ? colors.miningLight : colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: radius.md,
                background: colors.mining + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                ⛏️
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.slate800, fontFamily: font.sans, marginBottom: 2 }}>
                  Mining Module
                </div>
                <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                  $499/mo · IoT telemetry &amp; ESG
                </div>
              </div>
            </div>
            {miningActive ? (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.success,
                background: colors.successLight,
                border: `1px solid ${colors.successBorder}`,
                borderRadius: radius.full,
                padding: '3px 10px',
                fontFamily: font.sans,
                flexShrink: 0,
              }}>
                Active
              </span>
            ) : (
              <button
                onClick={() => alert('Contact sales@minechain.ai to upgrade.')}
                style={{
                  padding: '6px 14px',
                  borderRadius: radius.md,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: font.sans,
                  color: colors.mining,
                  background: 'transparent',
                  border: `1.5px solid ${colors.mining}`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Billing History ────────────────────────────────────────────── */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        boxShadow: colors.shadowMd,
        overflow: 'hidden',
        marginBottom: 28,
      }}>
        <div style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>
            Billing History
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ background: colors.slate50 }}>
              <th style={{ padding: '10px 28px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: colors.slate500, fontFamily: font.sans, borderBottom: `1px solid ${colors.border}` }}>Period</th>
              <th style={{ padding: '10px 20px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: colors.slate500, fontFamily: font.sans, borderBottom: `1px solid ${colors.border}` }}>Amount</th>
              <th style={{ padding: '10px 20px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: colors.slate500, fontFamily: font.sans, borderBottom: `1px solid ${colors.border}` }}>Status</th>
              <th style={{ padding: '10px 28px', textAlign: 'right' as const, fontSize: 12, fontWeight: 600, color: colors.slate500, fontFamily: font.sans, borderBottom: `1px solid ${colors.border}` }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {BILLING_HISTORY.map((row, i) => (
              <tr key={row.period} style={{ borderBottom: i < BILLING_HISTORY.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                <td style={{ padding: '14px 28px', fontSize: 14, color: colors.slate800, fontFamily: font.sans, fontWeight: 500 }}>
                  {row.period}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14, color: colors.slate700, fontFamily: font.sans, fontWeight: 600 }}>
                  {row.amount}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: colors.success,
                    background: colors.successLight,
                    border: `1px solid ${colors.successBorder}`,
                    borderRadius: radius.full,
                    padding: '3px 10px',
                    fontFamily: font.sans,
                  }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '14px 28px', textAlign: 'right' as const }}>
                  <button
                    onClick={() => {}}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.primary,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: font.sans,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
