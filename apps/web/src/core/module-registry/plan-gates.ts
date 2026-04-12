import type { AccessTier, PlanTier } from './types';

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

// ── AccessTier ↔ PlanTier mapping ─────────────────────────────────────────────

/**
 * Maps AccessTier (human-readable, used on pricing pages) to the minimum
 * PlanTier required to unlock it.
 *   free        → STARTER (available on all plans)
 *   premium     → PROFESSIONAL
 *   enterprise  → ENTERPRISE
 *   specialized → MINING_ENTERPRISE (industry-specific)
 */
export const ACCESS_TIER_TO_PLAN: Record<AccessTier, PlanTier> = {
  free:        'STARTER',
  premium:     'PROFESSIONAL',
  enterprise:  'ENTERPRISE',
  specialized: 'MINING_ENTERPRISE',
};

/**
 * Derive the AccessTier for a given minimum PlanTier.
 * Inverse of ACCESS_TIER_TO_PLAN — used when displaying module cards.
 */
export function planToAccessTier(requiredPlan: PlanTier): AccessTier {
  switch (requiredPlan) {
    case 'STARTER':           return 'free';
    case 'PROFESSIONAL':      return 'premium';
    case 'ENTERPRISE':        return 'enterprise';
    case 'MINING_ENTERPRISE': return 'specialized';
  }
}

/**
 * Check whether the given tenant plan satisfies the required AccessTier.
 */
export function canAccessTier(tenantPlan: PlanTier, required: AccessTier): boolean {
  return planIncludes(tenantPlan, ACCESS_TIER_TO_PLAN[required]);
}

/**
 * Return all PlanTiers that satisfy an AccessTier requirement.
 */
export function plansForAccessTier(tier: AccessTier): PlanTier[] {
  const minPlan = ACCESS_TIER_TO_PLAN[tier];
  const minIdx = PLAN_ORDER.indexOf(minPlan);
  return PLAN_ORDER.filter((_, i) => i >= minIdx);
}
