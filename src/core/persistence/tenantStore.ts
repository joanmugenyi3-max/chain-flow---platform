import fs from 'fs';
import path from 'path';
import type { TenantModuleConfig } from '../module-registry/types';
import { readCollection, writeCollection, upsertItem } from './fileStore';

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  plan: import('../module-registry/types').PlanTier;
  industry: string;
  country: string;
  currency: string;
  timezone: string;
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

// ── Module config ─────────────────────────────────────────────────────────────
export function getTenantModuleConfig(tenantId: string): TenantModuleConfig {
  const items = readCollection<TenantModuleConfig>('module-config', tenantId);
  return items[0] ?? getDefaultModuleConfig(tenantId);
}

export function saveTenantModuleConfig(config: TenantModuleConfig): void {
  writeCollection('module-config', config.tenantId, [config]);
}

function getDefaultModuleConfig(tenantId: string): TenantModuleConfig {
  return {
    tenantId,
    enabledModuleIds: ['analytics', 'procurement', 'inventory', 'logistics', 'mining'],
    addOnModuleIds: [],
    moduleSettings: {},
    updatedAt: new Date().toISOString(),
  };
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
    industry: 'Mining',
    country: 'DRC',
    currency: 'USD',
    timezone: 'Africa/Kinshasa',
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
