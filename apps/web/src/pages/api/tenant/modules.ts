import type { NextApiRequest, NextApiResponse } from 'next';
import { getTenantModuleConfig, saveTenantModuleConfig } from '../../../core/persistence/tenantStore';
import { MODULE_REGISTRY } from '../../../core/module-registry/registry';
import { apiSuccess } from '../../../lib/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';

  if (req.method === 'GET') {
    const config = getTenantModuleConfig(tenantId);
    return res.status(200).json(apiSuccess(config));
  }

  if (req.method === 'PATCH') {
    const { enableModuleId, disableModuleId } = req.body as {
      enableModuleId?: string; disableModuleId?: string;
    };
    const config = getTenantModuleConfig(tenantId);

    if (enableModuleId && MODULE_REGISTRY[enableModuleId]) {
      if (!config.enabledModuleIds.includes(enableModuleId)) {
        config.enabledModuleIds.push(enableModuleId);
      }
    }
    if (disableModuleId) {
      config.enabledModuleIds = config.enabledModuleIds.filter(id => id !== disableModuleId);
    }
    config.updatedAt = new Date().toISOString();
    saveTenantModuleConfig(config);
    return res.status(200).json(apiSuccess(config));
  }

  return res.status(405).end();
}
