import type { NextApiRequest, NextApiResponse } from 'next';
import { ORDERED_MODULES } from '../../../core/module-registry/registry';
import { getTenantModuleConfig, saveTenantModuleConfig } from '../../../core/persistence/tenantStore';
import { apiSuccess } from '../../../lib/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';

  if (req.method === 'GET') {
    const config = getTenantModuleConfig(tenantId);
    const catalog = ORDERED_MODULES.map(m => ({
      ...m,
      isEnabled: config.enabledModuleIds.includes(m.id),
      isPurchased: config.addOnModuleIds.includes(m.id),
    }));
    return res.status(200).json(apiSuccess(catalog));
  }

  if (req.method === 'POST') {
    const { moduleId, action } = req.body as { moduleId: string; action: 'enable' | 'disable' };
    const config = getTenantModuleConfig(tenantId);

    if (action === 'enable') {
      if (!config.enabledModuleIds.includes(moduleId)) config.enabledModuleIds.push(moduleId);
    } else {
      config.enabledModuleIds = config.enabledModuleIds.filter(id => id !== moduleId);
    }
    config.updatedAt = new Date().toISOString();
    saveTenantModuleConfig(config);
    return res.status(200).json(apiSuccess({ success: true, moduleId, action }));
  }

  return res.status(405).end();
}
