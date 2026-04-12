import type { NextApiRequest, NextApiResponse } from 'next';
import { MODULE_REGISTRY, ORDERED_MODULES } from '../../../core/module-registry/registry';
import { planIncludes } from '../../../core/module-registry/plan-gates';
import { getTenant, getTenantModuleConfig, seedDemoTenant } from '../../../core/persistence/tenantStore';
import { apiSuccess } from '../../../lib/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const tenantId = (req.query.tenantId as string) ||
    (req.headers['x-tenant-id'] as string) || 'demo';

  // Seed demo tenant if it doesn't exist
  seedDemoTenant();

  const tenant = getTenant(tenantId);
  if (!tenant) return res.status(404).json({ data: null, error: 'Tenant not found' });

  const moduleConfig = getTenantModuleConfig(tenantId);
  const plan = tenant.plan;

  // Filter modules: must be in registry, enabled by admin, AND allowed by plan
  const enabledModules = ORDERED_MODULES.filter(m =>
    moduleConfig.enabledModuleIds.includes(m.id) &&
    planIncludes(plan, m.requiredPlan)
  );

  return res.status(200).json(apiSuccess({
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    plan: tenant.plan,
    industry: tenant.industry,
    currency: tenant.currency,
    timezone: tenant.timezone,
    user: {
      id: 'user-001',
      fullName: 'JoeObscura',
      email: 'joe@acme-mining.com',
      role: 'ADMIN',
      initials: 'JO',
      avatarColor: '#2563eb',
    },
    enabledModules,
    moduleConfig,
  }));
}
