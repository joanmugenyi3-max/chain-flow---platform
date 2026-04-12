// ─────────────────────────────────────────────────────────────────────────────
// Module Registry — Core Types
// Single source of truth for everything module-related.
// ─────────────────────────────────────────────────────────────────────────────

// ── Plan system ───────────────────────────────────────────────────────────────

/** Ordered plan tiers — STARTER is lowest, MINING_ENTERPRISE is highest */
export type PlanTier =
  | 'STARTER'
  | 'PROFESSIONAL'
  | 'ENTERPRISE'
  | 'MINING_ENTERPRISE';

/**
 * Human-readable access tier used on pricing pages and module cards.
 * Maps cleanly to PlanTier ranges.
 *   free      → available on STARTER+
 *   premium   → available on PROFESSIONAL+
 *   enterprise → available on ENTERPRISE+
 *   specialized → available on specific plans only (e.g. MINING_ENTERPRISE)
 */
export type AccessTier = 'free' | 'premium' | 'enterprise' | 'specialized';

// ── Industry system ───────────────────────────────────────────────────────────

/**
 * Supported industry verticals.
 * Each industry can have its own default module set and custom modules.
 * Adding a new industry requires zero changes to core logic —
 * just register modules with that industry tag.
 */
export type Industry =
  | 'mining'
  | 'agriculture'
  | 'health'
  | 'finance'
  | 'manufacturing'
  | 'retail'
  | 'logistics'
  | 'construction'
  | 'energy'
  | 'generic';

// ── Module building blocks ────────────────────────────────────────────────────

export type WorkflowType =
  | 'purchase_order_approval'
  | 'logistics_dispatch_approval'
  | 'contract_approval'
  | 'incident_closure'
  | 'budget_approval'
  | 'custom';

export type ModuleCategory =
  | 'core'        // Always-on foundation (analytics, settings)
  | 'operations'  // Day-to-day ops (procurement, inventory, logistics)
  | 'specialized' // Industry-specific (mining, health, agriculture)
  | 'analytics'   // Reporting and BI
  | 'finance'     // Financial management
  | 'hr'          // Human resources
  | 'crm';        // Customer relations

export type ModuleStatus = 'stable' | 'beta' | 'coming_soon' | 'deprecated';

/** A single feature flag within a module, gated by plan */
export interface ModuleFeatureFlag {
  id: string;
  label: string;
  description?: string;
  requiredPlan: PlanTier;
}

/** Semantic version string e.g. "1.2.0" */
export type SemVer = string;

// ── Core manifest ─────────────────────────────────────────────────────────────

/**
 * ModuleManifest — the complete declaration of a module.
 *
 * To add a new module to the platform:
 *   1. Create src/modules/<id>/manifest.ts with a ModuleManifest object
 *   2. Import it in registry.ts — no other file needs to change
 *
 * To add a new industry:
 *   1. Add the industry to the Industry type above
 *   2. Create module manifests with { industries: ['<new_industry>'] }
 *   3. Add the industry default set to INDUSTRY_DEFAULTS in industry-registry.ts
 */
export interface ModuleManifest {
  // ── Identity
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string;
  version: SemVer;
  status: ModuleStatus;

  // ── Navigation
  href: string;
  navOrder: number;
  color: string;

  // ── Access control
  requiredPlan: PlanTier;
  allowedPlans: PlanTier[];
  accessTier: AccessTier;
  isAddOn: boolean;
  addOnPriceMonthly?: number;
  addOnPriceYearly?: number;

  // ── Classification
  category: ModuleCategory;
  industries: Industry[];   // Which industries this module is relevant for
  tags: string[];

  // ── Dependencies
  /** IDs of modules that must be enabled before this module can be activated */
  dependencies: string[];
  /** IDs of modules that are enhanced when this module is also active */
  enhances?: string[];

  // ── Features
  features: ModuleFeatureFlag[];
  workflowTypes: WorkflowType[];

  // ── Metadata
  author?: string;
  docsUrl?: string;
  stats?: string;
  changelog?: ModuleChangeEntry[];
}

export interface ModuleChangeEntry {
  version: SemVer;
  date: string;
  notes: string;
}

// ── Registry types ─────────────────────────────────────────────────────────────

/** The live in-memory registry — a plain map of id → manifest */
export type ModuleRegistryMap = Map<string, ModuleManifest>;

/** Serialisable plain-object form used in API responses */
export type ModuleRegistry = Record<string, ModuleManifest>;

// ── Tenant module configuration ───────────────────────────────────────────────

/**
 * Stored per-tenant — what modules are enabled and how they are configured.
 * Lives in src/data/tenants/<tenantId>/module-config.json
 */
export interface TenantModuleConfig {
  tenantId: string;

  /** IDs explicitly enabled by admin (must also pass plan gate) */
  enabledModuleIds: string[];

  /** Add-on module IDs purchased separately */
  addOnModuleIds: string[];

  /** Per-module key-value settings */
  moduleSettings: Record<string, Record<string, unknown>>;

  /** ISO timestamp of last change */
  updatedAt: string;
}

// ── Resolution results (returned by module-loader) ───────────────────────────

export interface ModuleAccessResult {
  allowed: boolean;
  reason?: 'plan_insufficient' | 'not_enabled' | 'dependency_missing' | 'deprecated' | 'ok';
  missingDependencies?: string[];
  requiredPlan?: PlanTier;
}

export interface ModuleActivationResult {
  success: boolean;
  activatedIds: string[];
  skippedIds: string[];
  errors: Array<{ moduleId: string; reason: string }>;
}
