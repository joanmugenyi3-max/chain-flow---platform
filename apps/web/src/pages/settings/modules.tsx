import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import { useTenant } from '@/core/tenant/useTenant';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radius, font } from '@/lib/styles';
import { PLAN_ORDER } from '@/core/module-registry/plan-gates';
import type { PlanTier, ModuleManifest } from '@/core/module-registry/types';

// ── Plan metadata ─────────────────────────────────────────────────────────────

const PLAN_COLORS: Record<PlanTier, string> = {
  STARTER:           '#64748b',
  PROFESSIONAL:      '#2563eb',
  ENTERPRISE:        '#7c3aed',
  MINING_ENTERPRISE: '#f97316',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function planIncludes(tenantPlan: PlanTier, requiredPlan: PlanTier): boolean {
  return PLAN_ORDER.indexOf(tenantPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PlanPill({ tier, label }: { tier: PlanTier; label: string }) {
  const col = PLAN_COLORS[tier];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: col, background: col + '18',
      border: `1px solid ${col}40`, borderRadius: radius.full, padding: '2px 7px',
      fontFamily: font.sans, letterSpacing: '0.3px',
      textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const,
    }}>
      {label}
    </span>
  );
}

function ModuleCard({
  module, tenantPlan, labels, planLabels,
}: {
  module: ModuleManifest;
  tenantPlan: PlanTier;
  labels: { enabled: string; addon: string; features: string; configure: string; upgradeRequired: string };
  planLabels: Record<string, string>;
}) {
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.lg, boxShadow: colors.shadow,
      overflow: 'hidden', marginBottom: 16,
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderBottom: `1px solid ${colors.border}`,
        background: module.color + '06', flexWrap: 'wrap' as const, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: radius.md,
            background: module.color + '20', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22, flexShrink: 0,
            border: `1px solid ${module.color}30`,
          }}>
            {module.icon}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: colors.slate900, fontFamily: font.sans, letterSpacing: '-0.3px' }}>
                {module.name}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: colors.success,
                background: colors.successLight, border: `1px solid ${colors.successBorder}`,
                borderRadius: radius.full, padding: '2px 8px', fontFamily: font.sans,
              }}>
                {labels.enabled}
              </span>
              {module.isAddOn && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: colors.info,
                  background: colors.infoLight, border: `1px solid ${colors.infoBorder}`,
                  borderRadius: radius.full, padding: '2px 7px',
                  fontFamily: font.sans, letterSpacing: '0.3px',
                }}>
                  {labels.addon}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: colors.slate500, fontFamily: font.sans, maxWidth: 520 }}>
              {module.description}
            </p>
          </div>
        </div>

        {/* Configure button */}
        <button
          onClick={() => {}}
          style={{
            padding: '7px 16px', borderRadius: radius.md, fontSize: 13, fontWeight: 600,
            fontFamily: font.sans, color: module.color, background: 'transparent',
            border: `1.5px solid ${module.color}`, cursor: 'pointer', flexShrink: 0,
          }}
        >
          {labels.configure}
        </button>
      </div>

      {/* Feature list */}
      {module.features.length > 0 && (
        <div style={{ padding: '14px 24px 16px' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: colors.slate400,
            fontFamily: font.sans, textTransform: 'uppercase' as const,
            letterSpacing: '0.7px', marginBottom: 10,
          }}>
            {labels.features}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            {module.features.map((feature) => {
              const unlocked = planIncludes(tenantPlan, feature.requiredPlan);
              return (
                <div
                  key={feature.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: radius.md,
                    background: unlocked ? colors.successLight + 'aa' : colors.slate50,
                    border: `1px solid ${unlocked ? colors.successBorder : colors.border}`,
                    flexWrap: 'wrap' as const, gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, lineHeight: 1, color: unlocked ? colors.success : colors.slate300 }}>
                      {unlocked ? '✓' : '🔒'}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: unlocked ? colors.slate800 : colors.slate400, fontFamily: font.sans }}>
                      {feature.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlanPill tier={feature.requiredPlan} label={planLabels[feature.requiredPlan] ?? feature.requiredPlan.replace('_', ' ')} />
                    {!unlocked && (
                      <span style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans, fontStyle: 'italic' as const }}>
                        {labels.upgradeRequired}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ModulesSettingsPage() {
  const { enabledModules, plan } = useTenant();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { label: t('settingsPage.navGeneral'),      icon: '⚙️',  href: '/settings' },
    { label: t('settingsPage.navSubscription'), icon: '💳',  href: '/settings/subscription' },
    { label: t('settingsPage.navModules'),      icon: '📦',  href: '/settings/modules' },
    { label: t('settingsPage.navTeam'),         icon: '👥',  href: '/settings/team' },
    { label: t('settingsPage.navSecurity'),     icon: '🔒',  href: '/settings/security' },
  ];

  const planLabel = t(`plans.${plan}` as Parameters<typeof t>[0]) || plan.replace('_', ' ');

  const cardLabels = {
    enabled:         t('modulesSettingsPage.enabledBadge'),
    addon:           t('modulesSettingsPage.addonBadge'),
    features:        t('modulesSettingsPage.featuresLabel'),
    configure:       t('modulesSettingsPage.configureBtn'),
    upgradeRequired: t('modulesSettingsPage.upgradeRequired'),
  };

  const planLabels: Record<string, string> = {
    STARTER:           t('plans.STARTER'),
    PROFESSIONAL:      t('plans.PROFESSIONAL'),
    ENTERPRISE:        t('plans.ENTERPRISE'),
    MINING_ENTERPRISE: t('plans.MINING_ENTERPRISE'),
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('modulesSettingsPage.title')}
        description={t('modulesSettingsPage.description')}
        icon="📦"
      />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left sidebar nav ────────────────────────────────────────────── */}
        <nav style={{
          width: 200, flexShrink: 0, background: colors.white,
          border: `1px solid ${colors.border}`, borderRadius: radius.lg,
          boxShadow: colors.shadow, padding: '8px 0',
          position: 'sticky', top: 80,
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/settings/modules';
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', margin: '2px 8px', borderRadius: radius.md,
                  textDecoration: 'none', fontSize: 14,
                  fontWeight: isActive ? 600 : 500, fontFamily: font.sans,
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

          {/* Summary row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            padding: '12px 18px', background: colors.primaryLight,
            border: `1px solid ${colors.primaryBorder}`, borderRadius: radius.lg,
          }}>
            <span style={{ fontSize: 16 }}>📦</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.primary, fontFamily: font.sans }}>
              {enabledModules.length !== 1
                ? t('modulesSettingsPage.enabledCountPlural', { n: String(enabledModules.length) })
                : t('modulesSettingsPage.enabledCount', { n: String(enabledModules.length) })}
            </span>
            <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
              · {t('modulesSettingsPage.planLabel', { plan: planLabel })}
            </span>
          </div>

          {/* Module cards or empty state */}
          {enabledModules.length === 0 ? (
            <div style={{
              background: colors.white, border: `1px solid ${colors.border}`,
              borderRadius: radius.lg, padding: '60px 32px',
              textAlign: 'center' as const, boxShadow: colors.shadow,
            }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: colors.slate700, fontFamily: font.sans, marginBottom: 8 }}>
                {t('modulesSettingsPage.emptyTitle')}
              </div>
              <p style={{ margin: '0 auto', maxWidth: 380, fontSize: 14, color: colors.slate400, fontFamily: font.sans }}>
                {t('modulesSettingsPage.emptyDesc')}
              </p>
              <Link
                href="/settings/subscription"
                style={{
                  display: 'inline-block', marginTop: 20, padding: '9px 22px',
                  borderRadius: radius.md, background: colors.primary, color: colors.white,
                  fontSize: 14, fontWeight: 600, fontFamily: font.sans, textDecoration: 'none',
                }}
              >
                {t('modulesSettingsPage.viewPlansBtn')}
              </Link>
            </div>
          ) : (
            <div>
              {(enabledModules as ModuleManifest[]).map((module) => (
                <ModuleCard key={module.id} module={module} tenantPlan={plan} labels={cardLabels} planLabels={planLabels} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
