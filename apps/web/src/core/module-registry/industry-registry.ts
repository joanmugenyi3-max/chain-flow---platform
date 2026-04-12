// ─────────────────────────────────────────────────────────────────────────────
// Industry Registry
// Maps industry verticals to their default module sets.
// Adding a new industry requires ONLY adding an entry here —
// zero changes to core logic, UI, or the module registry.
// ─────────────────────────────────────────────────────────────────────────────

import type { Industry } from './types';

export interface IndustryDefaults {
  /** Human-readable label */
  label: string;
  /** Emoji icon for the industry */
  icon: string;
  /** Module IDs enabled by default for this industry */
  defaultModuleIds: string[];
  /** Module IDs that are add-ons recommended for this industry */
  recommendedAddOnIds: string[];
}

// ── Industry → defaults map ───────────────────────────────────────────────────

/**
 * Default module sets per industry.
 *
 * Rules:
 * - `defaultModuleIds`       → auto-enabled when a tenant onboards with this industry
 * - `recommendedAddOnIds`    → shown as "recommended" in the module marketplace
 * - 'analytics' is always included (core module, required for all industries)
 * - Order matters: dependencies must appear before dependents in `defaultModuleIds`
 */
export const INDUSTRY_DEFAULTS: Record<Industry, IndustryDefaults> = {
  mining: {
    label: 'Mining',
    icon: '⛏️',
    defaultModuleIds: ['analytics', 'procurement', 'inventory', 'logistics', 'mining'],
    recommendedAddOnIds: ['mining'],
  },

  manufacturing: {
    label: 'Manufacturing',
    icon: '🏭',
    defaultModuleIds: ['analytics', 'procurement', 'inventory', 'logistics'],
    recommendedAddOnIds: [],
  },

  agriculture: {
    label: 'Agriculture',
    icon: '🌾',
    defaultModuleIds: ['analytics', 'procurement', 'inventory'],
    recommendedAddOnIds: [],
  },

  health: {
    label: 'Healthcare',
    icon: '🏥',
    defaultModuleIds: ['analytics', 'procurement', 'inventory'],
    recommendedAddOnIds: [],
  },

  finance: {
    label: 'Finance',
    icon: '💰',
    defaultModuleIds: ['analytics', 'procurement'],
    recommendedAddOnIds: [],
  },

  retail: {
    label: 'Retail',
    icon: '🛍️',
    defaultModuleIds: ['analytics', 'procurement', 'inventory'],
    recommendedAddOnIds: [],
  },

  logistics: {
    label: 'Logistics',
    icon: '🚚',
    defaultModuleIds: ['analytics', 'procurement', 'inventory', 'logistics'],
    recommendedAddOnIds: [],
  },

  construction: {
    label: 'Construction',
    icon: '🏗️',
    defaultModuleIds: ['analytics', 'procurement', 'inventory'],
    recommendedAddOnIds: [],
  },

  energy: {
    label: 'Energy',
    icon: '⚡',
    defaultModuleIds: ['analytics', 'procurement', 'inventory', 'logistics'],
    recommendedAddOnIds: [],
  },

  generic: {
    label: 'General',
    icon: '🏢',
    defaultModuleIds: ['analytics', 'procurement', 'inventory'],
    recommendedAddOnIds: [],
  },
};

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Get the default module IDs for an industry (falls back to 'generic') */
export function getDefaultModulesForIndustry(industry: string): string[] {
  const key = industry.toLowerCase() as Industry;
  return (INDUSTRY_DEFAULTS[key] ?? INDUSTRY_DEFAULTS.generic).defaultModuleIds;
}

/** Get recommended add-on IDs for an industry */
export function getRecommendedAddOnsForIndustry(industry: string): string[] {
  const key = industry.toLowerCase() as Industry;
  return (INDUSTRY_DEFAULTS[key] ?? INDUSTRY_DEFAULTS.generic).recommendedAddOnIds;
}

/** Get human-readable label and icon for an industry */
export function getIndustryMeta(industry: string): { label: string; icon: string } {
  const key = industry.toLowerCase() as Industry;
  const entry = INDUSTRY_DEFAULTS[key] ?? INDUSTRY_DEFAULTS.generic;
  return { label: entry.label, icon: entry.icon };
}

/** All supported industry keys */
export function getAllIndustries(): Industry[] {
  return Object.keys(INDUSTRY_DEFAULTS) as Industry[];
}
