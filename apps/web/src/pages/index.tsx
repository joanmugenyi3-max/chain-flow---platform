import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import { colors, radius, font } from '../lib/styles';
import { useTenant } from '@/core/tenant/useTenant';
import { useTranslation } from '@/i18n/useTranslation';
import { ORDERED_MODULES } from '@/core/module-registry/registry';
import { planIncludes } from '@/core/module-registry/plan-gates';
import type { ModuleManifest } from '@/core/module-registry/types';

// ── Static recent activity ────────────────────────────────────────────────────
// These items contain proper nouns / reference codes — not translated.
const RECENT_ACTIVITY = [
  { time: '08:14', text: '24× Drill Bit 12" received — WH-Nord',               type: 'success' },
  { time: '07:50', text: 'PO-2026-0040 submitted for approval',                 type: 'warning' },
  { time: '07:22', text: 'SHP-1039 marked as delayed — new ETA Apr 12',         type: 'danger'  },
  { time: '06:55', text: 'AI Insight: Reorder LUB-ENG-20L (critical level)',    type: 'info'    },
  { time: 'Yesterday', text: 'Contract CTR-016 expiring in 81 days',            type: 'warning' },
];

const actColor: Record<string, string> = {
  success: colors.success,
  warning: colors.warning,
  danger:  colors.danger,
  info:    colors.info,
};

// ── KPI banner shape ──────────────────────────────────────────────────────────
interface BannerKpis {
  openPos: number;
  activeShipments: number;
  alerts: number;
}

// ── Module skeleton card ──────────────────────────────────────────────────────
function ModuleSkeleton() {
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.lg, padding: '18px 20px', boxShadow: colors.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: radius.md, background: colors.slate200 }} />
        <div style={{ width: 100, height: 14, borderRadius: 4, background: colors.slate200 }} />
      </div>
      <div style={{ height: 12, width: '80%', borderRadius: 4, background: colors.slate100, marginBottom: 6 }} />
      <div style={{ height: 12, width: '60%', borderRadius: 4, background: colors.slate100 }} />
    </div>
  );
}

// ── Accessible module card ────────────────────────────────────────────────────
function ModuleCard({ mod }: { mod: ModuleManifest }) {
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation();

  // Derive translation key from module id; fall back to registry value if key missing
  const nameKey  = `modules.${mod.id}.name`;
  const descKey  = `modules.${mod.id}.description`;
  const statsKey = `modules.${mod.id}.stats`;
  const name  = t(nameKey)  !== nameKey  ? t(nameKey)  : mod.name;
  const desc  = t(descKey)  !== descKey  ? t(descKey)  : mod.description;
  const stats = t(statsKey) !== statsKey ? t(statsKey) : (mod.stats ?? '—');

  return (
    <Link href={mod.href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: colors.white,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          padding: '18px 20px',
          cursor: 'pointer',
          boxShadow: hovered ? colors.shadowMd : colors.shadow,
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'box-shadow 0.15s, transform 0.15s',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: radius.md,
            background: mod.color + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            {mod.icon}
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: colors.slate900, fontFamily: font.sans }}>
            {name}
          </span>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: colors.slate500, lineHeight: 1.5, fontFamily: font.sans }}>
          {desc}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: mod.color, fontWeight: 600, fontFamily: font.sans }}>
            {stats}
          </span>
          <span style={{ color: colors.slate300, fontSize: 14 }}>→</span>
        </div>
      </div>
    </Link>
  );
}

// ── Plan-locked module card ───────────────────────────────────────────────────
function LockedModuleCard({ mod }: { mod: ModuleManifest }) {
  const { t } = useTranslation();

  const nameKey = `modules.${mod.id}.name`;
  const descKey = `modules.${mod.id}.description`;
  const name = t(nameKey) !== nameKey ? t(nameKey) : mod.name;
  const desc = t(descKey) !== descKey ? t(descKey) : mod.description;

  // Translate the required plan label
  const planKey = `plans.${mod.requiredPlan}` as Parameters<typeof t>[0];
  const planLabel = t(planKey) !== planKey ? t(planKey) : mod.requiredPlan.replace('_', ' ');

  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: '18px 20px',
      boxShadow: colors.shadow,
      opacity: 0.55,
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Upgrade ribbon */}
      <div style={{
        position: 'absolute', top: 10, right: -18,
        background: '#f59e0b', color: colors.white,
        fontSize: 9, fontWeight: 700, padding: '2px 22px',
        transform: 'rotate(35deg)', fontFamily: font.sans, letterSpacing: '0.05em',
      }}>
        {t('dashboard.upgradeLabel')}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: radius.md,
          background: colors.slate100, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, filter: 'grayscale(1)',
        }}>
          {mod.icon}
        </div>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color: colors.slate700, fontFamily: font.sans }}>
            {name}
          </span>
          <div style={{ fontSize: 10, color: colors.slate400, fontFamily: font.sans, marginTop: 1 }}>
            {t('dashboard.requiresPlan', { plan: planLabel })}
          </div>
        </div>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: colors.slate400, lineHeight: 1.5, fontFamily: font.sans }}>
        {desc}
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/settings/subscription" style={{
          fontSize: 11, color: colors.primary, fontWeight: 600,
          fontFamily: font.sans, textDecoration: 'none',
        }}>
          {t('dashboard.viewPlans')}
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { enabledModules, plan, user, tenantName, isLoading } = useTenant();
  const { t } = useTranslation();

  // Live KPIs
  const [kpis, setKpis] = useState<BannerKpis>({ openPos: 7, activeShipments: 14, alerts: 3 });
  useEffect(() => {
    fetch('/api/analytics/kpis')
      .then(r => r.json())
      .then(json => {
        if (json?.data) {
          setKpis({
            openPos:         json.data.procurement?.pendingApproval ?? 7,
            activeShipments: json.data.logistics?.activeShipments   ?? 14,
            alerts:          json.data.overall?.alerts               ?? 3,
          });
        }
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  // Greeting — depends on current hour
  const hour = new Date().getHours();
  const greetingKey = hour < 12
    ? 'dashboard.greetingMorning'
    : hour < 18
    ? 'dashboard.greetingAfternoon'
    : 'dashboard.greetingEvening';
  const greeting = t(greetingKey as Parameters<typeof t>[0]);
  const displayName = user?.fullName ?? '';

  // Date string — client-side only (avoids SSR mismatch)
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }));
  }, []);

  // Locked modules: in registry, plan gate fails, not already enabled
  const lockedModules: ModuleManifest[] = ORDERED_MODULES.filter(m =>
    !enabledModules.some(e => e.id === m.id) &&
    !planIncludes(plan, m.requiredPlan)
  );

  const bannerStats = [
    { label: t('dashboard.openPos'),         value: String(kpis.openPos)         },
    { label: t('dashboard.activeShipments'), value: String(kpis.activeShipments) },
    { label: t('dashboard.alerts'),          value: String(kpis.alerts)           },
  ];

  return (
    <PageLayout>

      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.slate900} 0%, #1e3a5f 100%)`,
        borderRadius: radius.xl, padding: '28px 32px', marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.white, fontFamily: font.sans, letterSpacing: '-0.4px' }}>
            {greeting}{displayName ? `, ${displayName}` : ''} 👋
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontFamily: font.sans }}>
            {tenantName} · {t('dashboard.tagline')}{dateStr ? ` · ${dateStr}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {bannerStats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: colors.white, fontFamily: font.sans }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: font.sans }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active modules grid ─────────────────────────────────────────── */}
      <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.slate700, margin: '0 0 14px', fontFamily: font.sans }}>
        {t('dashboard.modulesHeading')}
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: 14,
        marginBottom: lockedModules.length > 0 ? 24 : 32,
      }}>
        {isLoading
          ? [1, 2, 3, 4, 5].map(i => <ModuleSkeleton key={i} />)
          : enabledModules.map(mod => <ModuleCard key={mod.id} mod={mod} />)
        }
      </div>

      {/* ── Locked modules ──────────────────────────────────────────────── */}
      {!isLoading && lockedModules.length > 0 && (
        <>
          <h2 style={{
            fontSize: 13, fontWeight: 600, color: colors.slate500,
            margin: '0 0 12px', fontFamily: font.sans,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>🔒</span>
            {t('dashboard.availableOnHigherPlans')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: 14,
            marginBottom: 32,
          }}>
            {lockedModules.map(mod => <LockedModuleCard key={mod.id} mod={mod} />)}
          </div>
        </>
      )}

      {/* ── Recent activity ─────────────────────────────────────────────── */}
      <div style={{
        background: colors.white, border: `1px solid ${colors.border}`,
        borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow,
      }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>
          {t('dashboard.recentActivity')}
        </h3>
        {RECENT_ACTIVITY.map((a, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '9px 0',
              borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${colors.border}` : 'none',
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: actColor[a.type] ?? colors.slate400,
              marginTop: 5, flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>
              {a.text}
            </span>
            <span style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans, flexShrink: 0 }}>
              {a.time}
            </span>
          </div>
        ))}
      </div>

    </PageLayout>
  );
}
