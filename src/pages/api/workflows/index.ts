import type { NextApiRequest, NextApiResponse } from 'next';
import { readCollection, upsertItem } from '../../../core/persistence/fileStore';
import type { WorkflowInstance } from '../../../core/workflow/types';
import { apiSuccess } from '../../../lib/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';

  if (req.method === 'GET') {
    const workflows = readCollection<WorkflowInstance>('workflows', tenantId);
    const { status, module: mod } = req.query;
    let filtered = workflows;
    if (status) filtered = filtered.filter(w => w.status === status);
    if (mod) filtered = filtered.filter(w => w.entityModule === mod);
    const pending = filtered.filter(w => ['PENDING_REVIEW', 'PENDING_APPROVAL'].includes(w.status));
    return res.status(200).json(apiSuccess({ all: filtered, pending, pendingCount: pending.length }));
  }

  return res.status(405).end();
}
