import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import { useTenant } from '@/core/tenant/useTenant';
import { useTranslation } from '@/i18n/useTranslation';
import { apiFetch } from '@/lib/api';
import { colors, radius, font } from '@/lib/styles';

// ── Types ────────────────────────────────────────────────────────────────────

interface ModuleFeature {
  id: string;
  label: string;
  requiredPlan: string;
}

interface MarketplaceModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiredPlan: string;
  isAddOn: boolean;
  addOnPriceMonthly?: number;
  isEnabled: boolean;
  isPurchased: boolean;
  features: ModuleFeature[];
  stats?: string;
  tags: string[];
}

interface MarketplaceCatalogResponse {
  catalog: MarketplaceModule[];
}

// ── Plan ordering ─────────────────────────────────────────────────────────────

const PLAN_ORDER = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'];

function planLabel(p: string): string {
  return p.replace(/_/g, ' ');
}

const PLAN_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  STARTER:          { bg: colors.slate100,                          text: colors.slate700 },
  PROFESSIONAL:     { bg: '#ede9fe',                                text: '#7c3aed' },
  ENTERPRISE:       { bg: colors.primaryLight ?? '#eff6ff',         text: colors.primary },
  MINING_ENTERPRISE:{ bg: colors.miningLight  ?? '#fff7ed',         text: colors.mining },
};

function PlanBadge({ plan }: { plan: string }) {
  const style = PLAN_BADGE_COLORS[plan] ?? { bg: colors.slate100, text: colors.slate500 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.5px', textTransform: 'uppercase' as const,
      padding: '2px 7px', borderRadius: radius.full,
      background: style.bg, color: style.text, fontFamily: font.sans,
    }}>
      {planLabel(plan)}
    </span>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.xl, padding: 20, display: 'flex', flexDirection: 'column',
      gap: 12, boxShadow: colors.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: radius.lg, background: colors.slate100 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 14, width: '60%', borderRadius: radius.sm, background: colors.slate100 }} />
          <div style={{ height: 10, width: '40%', borderRadius: radius.sm, background: colors.slate100 }} />
        </div>
      </div>
      <div style={{ height: 10, borderRadius: radius.sm, background: colors.slate100 }} />
      <div style={{ height: 10, width: '80%', borderRadius: radius.sm, background: colors.slate100 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 9, width: `${50 + i * 10}%`, borderRadius: radius.sm, background: colors.slate100 }} />
        ))}
      </div>
      <div style={{ height: 34, borderRadius: radius.md, background: colors.slate100, marginTop: 4 }} />
    </div>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────

interface ModuleCardProps {
  mod: MarketplaceModule;
  plan: string;
  toggling: boolean;
  onToggle: (id: string, enable: boolean) => void;
  labels: {
    active: string; addon: string; moreFeatures: (n: number) => string;
    upgradeToEnable: (plan: string) => string; disable: string; enable: string;
  };
}

function ModuleCard({ mod, plan, toggling, onToggle, labels }: ModuleCardProps) {
  const needsUpgrade = PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(mod.requiredPlan);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: colors.white,
        border: `1px solid ${hovered ? mod.color + '60' : colors.border}`,
        borderRadius: radius.xl,
        padding: '20px 20px 18px',
        display: 'flex', flexDirection: 'column', gap: 0,
        boxShadow: hovered ? `0 4px 16px ${mod.color}18` : colors.shadow,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: radius.lg,
          background: mod.color + '20', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 22, flexShrink: 0,
        }}>
          {mod.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.slate900, fontFamily: font.sans, lineHeight: 1.3 }}>
              {mod.name}
            </span>
            {mod.isEnabled && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: colors.successLight ?? '#ecfdf5', color: colors.success,
                borderRadius: radius.full, padding: '1px 7px', letterSpacing: '0.3px', fontFamily: font.sans,
              }}>
                {labels.active}
              </span>
            )}
          </div>
          <div style={{ marginTop: 4 }}>
            <PlanBadge plan={mod.requiredPlan} />
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ margin: '0 0 12px', fontSize: 13, color: colors.slate500, lineHeight: 1.6, fontFamily: font.sans }}>
        {mod.description}
      </p>

      {/* Features list */}
      {mod.features.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          {mod.features.slice(0, 4).map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.slate700, fontFamily: font.sans }}>
              <span style={{ color: colors.success, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
              {f.label}
            </div>
          ))}
          {mod.features.length > 4 && (
            <div style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans, paddingLeft: 17 }}>
              {labels.moreFeatures(mod.features.length - 4)}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {mod.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginBottom: 12 }}>
          {mod.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: 10, color: colors.slate500, background: colors.slate50,
              border: `1px solid ${colors.border}`, borderRadius: radius.full,
              padding: '2px 8px', fontFamily: font.sans,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      {mod.stats && (
        <div style={{ fontSize: 12, color: mod.color, fontWeight: 600, fontFamily: font.sans, marginBottom: 14 }}>
          {mod.stats}
        </div>
      )}

      {/* Add-on price */}
      {mod.isAddOn && mod.addOnPriceMonthly != null && (
        <div style={{ fontSize: 12, color: colors.slate500, fontFamily: font.sans, marginBottom: 10 }}>
          <span style={{ fontWeight: 700, color: colors.slate700, fontSize: 14 }}>${mod.addOnPriceMonthly}/mo</span>
          {' '}
          <span style={{
            fontSize: 10, fontWeight: 600,
            background: colors.miningLight ?? '#fff7ed', color: colors.mining,
            borderRadius: radius.full, padding: '1px 6px', fontFamily: font.sans,
          }}>
            {labels.addon}
          </span>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: colors.border, margin: '4px 0 14px' }} />

      {/* Action */}
      {needsUpgrade ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          background: colors.slate50, borderRadius: radius.md, border: `1px dashed ${colors.border}`,
          fontSize: 12, color: colors.slate400, fontFamily: font.sans, fontWeight: 500,
        }}>
          <span>🔒</span>
          {labels.upgradeToEnable(planLabel(mod.requiredPlan))}
        </div>
      ) : (
        <button
          disabled={toggling}
          onClick={() => onToggle(mod.id, !mod.isEnabled)}
          style={{
            width: '100%', padding: '9px 16px', borderRadius: radius.md,
            fontSize: 13, fontWeight: 600, fontFamily: font.sans,
            cursor: toggling ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s', opacity: toggling ? 0.6 : 1,
            ...(mod.isEnabled
              ? { background: 'transparent', border: `1.5px solid ${colors.danger}`, color: colors.danger }
              : { background: colors.primary, border: `1.5px solid ${colors.primary}`, color: colors.white }),
          }}
        >
          {toggling ? '...' : mod.isEnabled ? labels.disable : labels.enable}
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { tenantId, plan } = useTenant();
  const { t } = useTranslation();
  const [modules, setModules] = useState<MarketplaceModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setError(null);
      const res = await apiFetch<MarketplaceCatalogResponse>('/api/marketplace', { tenantId });
      setModules(res.data.catalog);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('marketplacePage.errorLoad'));
    } finally {
      setLoading(false);
    }
  }, [tenantId, t]);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const handleToggle = useCallback(async (moduleId: string, enable: boolean) => {
    setToggling(moduleId);
    try {
      await apiFetch('/api/marketplace', {
        method: 'POST',
        body: JSON.stringify({ moduleId, enable }),
        tenantId,
      });
      setModules((prev) => prev.map((m) => m.id === moduleId ? { ...m, isEnabled: enable } : m));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('marketplacePage.errorToggle'));
    } finally {
      setToggling(null);
    }
  }, [tenantId, t]);

  const enabledCount = modules.filter((m) => m.isEnabled).length;

  const cardLabels = {
    active:           t('marketplacePage.activeLabel'),
    addon:            t('marketplacePage.addonLabel'),
    moreFeatures:     (n: number) => t('marketplacePage.moreFeatures', { n: String(n) }),
    upgradeToEnable:  (p: string) => t('marketplacePage.upgradeToEnable', { plan: p }),
    disable:          t('marketplacePage.disable'),
    enable:           t('marketplacePage.enable'),
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('marketplacePage.title')}
        description={t('marketplacePage.description')}
        icon="🏪"
      />

      {/* Summary bar */}
      {!loading && !error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: colors.white, border: `1px solid ${colors.border}`,
          borderRadius: radius.lg, padding: '12px 20px', marginBottom: 24,
          boxShadow: colors.shadow, fontFamily: font.sans, flexWrap: 'wrap' as const,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: radius.md, background: colors.primary + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              📦
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.slate900 }}>
              {enabledCount !== 1
                ? t('marketplacePage.enabledCountPlural', { n: String(enabledCount) })
                : t('marketplacePage.enabledCount', { n: String(enabledCount) })}
            </span>
          </div>
          <div style={{ width: 1, height: 18, background: colors.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: colors.slate500 }}>{t('marketplacePage.planLabel')}</span>
            <PlanBadge plan={plan} />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: colors.slate400 }}>
            {t('marketplacePage.catalogCount', { n: String(modules.length) })}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: colors.dangerLight ?? '#fef2f2', border: `1px solid ${colors.dangerBorder ?? '#fecaca'}`,
          borderRadius: radius.lg, padding: '14px 20px', marginBottom: 24,
          fontSize: 14, color: colors.danger, fontFamily: font.sans,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚠️</span>
          {error}
          <button
            onClick={fetchModules}
            style={{
              marginLeft: 'auto', background: 'none', border: `1px solid ${colors.danger}`,
              borderRadius: radius.md, color: colors.danger, fontSize: 12,
              fontWeight: 600, padding: '4px 12px', cursor: 'pointer', fontFamily: font.sans,
            }}
          >
            {t('marketplacePage.retry')}
          </button>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                plan={plan}
                toggling={toggling === mod.id}
                onToggle={handleToggle}
                labels={cardLabels}
              />
            ))}
      </div>

      {/* Empty state */}
      {!loading && !error && modules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', fontFamily: font.sans }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.slate700, marginBottom: 6 }}>
            {t('marketplacePage.emptyTitle')}
          </div>
          <div style={{ fontSize: 14, color: colors.slate400 }}>
            {t('marketplacePage.emptyDesc')}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
