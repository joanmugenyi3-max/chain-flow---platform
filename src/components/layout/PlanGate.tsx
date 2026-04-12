import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/core/tenant/useTenant';
import { planIncludes } from '@/core/module-registry/plan-gates';
import { colors, radius, font } from '@/lib/styles';
import type { PlanTier } from '@/core/module-registry/types';

const PLAN_LABELS: Record<PlanTier, string> = {
  STARTER: 'Starter',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
  MINING_ENTERPRISE: 'Mining Enterprise',
};

interface PlanGateProps {
  requiredPlan: PlanTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PlanGate({ requiredPlan, children, fallback }: PlanGateProps) {
  const { plan, isLoading } = useTenant();

  if (isLoading) return null;

  if (!planIncludes(plan, requiredPlan)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div style={{
        background: colors.warningLight, border: `1px solid ${colors.warningBorder}`,
        borderRadius: radius.lg, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 28 }}>⬆️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: colors.slate900, fontFamily: font.sans }}>
            Upgrade Required
          </div>
          <div style={{ fontSize: 13, color: colors.slate600, marginTop: 2, fontFamily: font.sans }}>
            This feature requires the <strong>{PLAN_LABELS[requiredPlan]}</strong> plan.
            Your current plan is <strong>{PLAN_LABELS[plan]}</strong>.
          </div>
        </div>
        <Link href="/settings/subscription" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
          <div style={{
            background: colors.warning, color: colors.white,
            borderRadius: radius.md, padding: '8px 20px',
            fontWeight: 600, fontSize: 13, fontFamily: font.sans, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            Upgrade Plan
          </div>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
