import type { PlanTier } from './types';

export const PLAN_ORDER: PlanTier[] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'];

export const PLAN_MODULE_MATRIX: Record<string, PlanTier> = {
  analytics: 'STARTER',
  procurement: 'STARTER',
  inventory: 'STARTER',
  logistics: 'PROFESSIONAL',
  production: 'PROFESSIONAL',
  mining: 'MINING_ENTERPRISE',
  finance: 'ENTERPRISE',
  hr: 'ENTERPRISE',
  crm: 'PROFESSIONAL',
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  STARTER: 'Starter',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
  MINING_ENTERPRISE: 'Mining Enterprise',
};

export const PLAN_COLORS: Record<PlanTier, string> = {
  STARTER: '#64748b',
  PROFESSIONAL: '#2563eb',
  ENTERPRISE: '#7c3aed',
  MINING_ENTERPRISE: '#f97316',
};

export const PLAN_PRICES: Record<PlanTier, { monthly: number; yearly: number }> = {
  STARTER: { monthly: 99, yearly: 79 },
  PROFESSIONAL: { monthly: 499, yearly: 399 },
  ENTERPRISE: { monthly: 1499, yearly: 1199 },
  MINING_ENTERPRISE: { monthly: 2499, yearly: 1999 },
};

export function planIncludes(tenantPlan: PlanTier, requiredPlan: PlanTier): boolean {
  return PLAN_ORDER.indexOf(tenantPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}

export function getUpgradeTarget(currentPlan: PlanTier, requiredPlan: PlanTier): PlanTier | null {
  if (planIncludes(currentPlan, requiredPlan)) return null;
  return requiredPlan;
}
