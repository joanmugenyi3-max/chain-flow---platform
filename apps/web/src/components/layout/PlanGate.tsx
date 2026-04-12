import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/core/tenant/useTenant';
import { planIncludes } from '@/core/module-registry/plan-gates';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radius, font } from '@/lib/styles';
import type { PlanTier } from '@/core/module-registry/types';

interface PlanGateProps {
  requiredPlan: PlanTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PlanGate({ requiredPlan, children, fallback }: PlanGateProps) {
  const { plan, isLoading } = useTenant();
  const { t } = useTranslation();

  if (isLoading) return null;

  if (!planIncludes(plan, requiredPlan)) {
    if (fallback) return <>{fallback}</>;

    // Resolve plan labels via t() — fall back to raw plan key if key missing
    const requiredLabel = t(`plans.${requiredPlan}` as Parameters<typeof t>[0]) || requiredPlan.replace('_', ' ');
    const currentLabel  = t(`plans.${plan}` as Parameters<typeof t>[0]) || plan.replace('_', ' ');

    return (
      <div style={{
        background: colors.warningLight, border: `1px solid ${colors.warningBorder}`,
        borderRadius: radius.lg, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 28 }}>⬆️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: colors.slate900, fontFamily: font.sans }}>
            {t('guard.upgradeRequired')}
          </div>
          <div style={{ fontSize: 13, color: colors.slate600, marginTop: 2, fontFamily: font.sans }}>
            {t('guard.upgradeDesc', { required: requiredLabel, current: currentLabel })}
          </div>
        </div>
        <Link href="/settings/subscription" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
          <div style={{
            background: colors.warning, color: colors.white,
            borderRadius: radius.md, padding: '8px 20px',
            fontWeight: 600, fontSize: 13, fontFamily: font.sans, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {t('guard.upgradeBtn')}
          </div>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
