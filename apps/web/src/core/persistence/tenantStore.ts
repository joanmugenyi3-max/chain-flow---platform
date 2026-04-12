import fs from 'fs';
import path from 'path';
import type { TenantModuleConfig, ModuleActivationResult } from '../module-registry/types';
import { readCollection, writeCollection, upsertItem } from './fileStore';
import { getDefaultModulesForIndustry } from '../module-registry/industry-registry';
import { getActivationOrder, getAllDependents } from '../module-registry/dependency-resolver';
import { MODULE_REGISTRY } from '../module-registry/registry';
import { planIncludes } from '../module-registry/plan-gates';

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  plan: import('../module-registry/types').PlanTier;
  industry: string;
  country: string;
  currency: string;
  timezone: string;
  language?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
  isActive: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'tenants');
const META_FILE = path.join(process.cwd(), 'src', 'data', 'tenants.json');

// ── Tenant CRUD ───────────────────────────────────────────────────────────────

export function getAllTenants(): TenantConfig[] {
  if (!fs.existsSync(META_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(META_FILE, 'utf-8')); } catch { return []; }
}

export function saveTenant(tenant: TenantConfig): void {
  const tenants = getAllTenants();
  const idx = tenants.findIndex(t => t.id === tenant.id);
  if (idx >= 0) tenants[idx] = tenant; else tenants.push(tenant);
  const dir = path.dirname(META_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(META_FILE, JSON.stringify(tenants, null, 2));
}

export function getTenant(id: string): TenantConfig | null {
  return getAllTenants().find(t => t.id === id) ?? null;
}

export function updateTenantLanguage(tenantId: string, language: string): boolean {
  const tenant = getTenant(tenantId);
  if (!tenant) return false;
  saveTenant({ ...tenant, language, updatedAt: new Date().toISOString() });
  return true;
}

// ── Module config ─────────────────────────────────────────────────────────────

export function getTenantModuleConfig(tenantId: string): TenantModuleConfig {
  const items = readCollection<TenantModuleConfig>('module-config', tenantId);
  if (items[0]) return items[0];

  // First access — seed from industry defaults
  const tenant = getTenant(tenantId);
  const industry = tenant?.industry ?? 'generic';
  return getDefaultModuleConfig(tenantId, industry);
}

export function saveTenantModuleConfig(config: TenantModuleConfig): void {
  writeCollection('module-config', config.tenantId, [config]);
}

function getDefaultModuleConfig(tenantId: string, industry = 'generic'): TenantModuleConfig {
  return {
    tenantId,
    enabledModuleIds: getDefaultModulesForIndustry(industry),
    addOnModuleIds: [],
    moduleSettings: {},
    updatedAt: new Date().toISOString(),
  };
}

// ── Module activation / deactivation ─────────────────────────────────────────

/**
 * Activate one or more modules for a tenant.
 * - Resolves and activates dependencies first (topological order)
 * - Checks plan gates before activating each module
 * - Returns a full activation result with success/skip/error breakdown
 */
export function activateModules(
  tenantId: string,
  moduleIds: string[]
): ModuleActivationResult {
  const config = getTenantModuleConfig(tenantId);
  const tenant = getTenant(tenantId);
  const tenantPlan = tenant?.plan ?? 'STARTER';

  // Use the static registry as the source of truth (module-loader may not be seeded server-side)
  const registryMap = new Map(Object.entries(MODULE_REGISTRY));

  const { sorted, cycles } = getActivationOrder(moduleIds, registryMap);

  const activatedIds: string[] = [];
  const skippedIds: string[] = [];
  const errors: ModuleActivationResult['errors'] = [];
  const currentEnabled = new Set(config.enabledModuleIds);

  if (cycles.length > 0) {
    for (const cycle of cycles) {
      errors.push({
        moduleId: cycle[0],
        reason: `Circular dependency detected: ${cycle.join(' → ')}`,
      });
    }
    return { success: false, activatedIds, skippedIds, errors };
  }

  for (const id of sorted) {
    if (currentEnabled.has(id)) {
      skippedIds.push(id); // already enabled
      continue;
    }

    const manifest = registryMap.get(id);
    if (!manifest) {
      errors.push({ moduleId: id, reason: 'Module not found in registry' });
      continue;
    }

    if (!planIncludes(tenantPlan, manifest.requiredPlan)) {
      errors.push({
        moduleId: id,
        reason: `Requires ${manifest.requiredPlan} plan (tenant has ${tenantPlan})`,
      });
      continue;
    }

    currentEnabled.add(id);
    activatedIds.push(id);
  }

  if (activatedIds.length > 0) {
    const updated: TenantModuleConfig = {
      ...config,
      enabledModuleIds: Array.from(currentEnabled),
      updatedAt: new Date().toISOString(),
    };
    saveTenantModuleConfig(updated);
  }

  return {
    success: errors.length === 0,
    activatedIds,
    skippedIds,
    errors,
  };
}

/**
 * Deactivate a module for a tenant.
 * - Refuses if other enabled modules depend on it (returns errors)
 * - Returns a full activation result
 */
export function deactivateModule(
  tenantId: string,
  moduleId: string
): ModuleActivationResult {
  const config = getTenantModuleConfig(tenantId);
  const registryMap = new Map(Object.entries(MODULE_REGISTRY));

  const enabledSet = new Set(config.enabledModuleIds);
  const dependents = getAllDependents(moduleId, registryMap).filter(id => enabledSet.has(id));

  if (dependents.length > 0) {
    return {
      success: false,
      activatedIds: [],
      skippedIds: [],
      errors: [{
        moduleId,
        reason: `Cannot deactivate — the following enabled modules depend on it: ${dependents.join(', ')}`,
      }],
    };
  }

  if (!enabledSet.has(moduleId)) {
    return { success: true, activatedIds: [], skippedIds: [moduleId], errors: [] };
  }

  enabledSet.delete(moduleId);
  const updated: TenantModuleConfig = {
    ...config,
    enabledModuleIds: Array.from(enabledSet),
    updatedAt: new Date().toISOString(),
  };
  saveTenantModuleConfig(updated);

  return { success: true, activatedIds: [], skippedIds: [], errors: [] };
}

// ── Default tenant seed ───────────────────────────────────────────────────────

export function seedDemoTenant(): void {
  const existing = getTenant('demo');
  if (existing) return;

  const tenant: TenantConfig = {
    id: 'demo',
    name: 'ACME Mining Corp',
    slug: 'acme-mining',
    plan: 'MINING_ENTERPRISE',
    industry: 'mining',
    country: 'DRC',
    currency: 'USD',
    timezone: 'Africa/Kinshasa',
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveTenant(tenant);

  const user: TenantUser = {
    id: 'user-001',
    tenantId: 'demo',
    fullName: 'JoeObscura',
    email: 'joe@acme-mining.com',
    role: 'ADMIN',
    initials: 'JO',
    avatarColor: '#2563eb',
    isActive: true,
  };
  upsertItem<TenantUser>('users', 'demo', user);
}
