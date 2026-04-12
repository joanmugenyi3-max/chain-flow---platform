import type { NextApiRequest, NextApiResponse } from 'next';
import { findById, upsertItem, removeItem } from '../../../../core/persistence/fileStore';
import type { PurchaseOrder } from './index';
import { apiSuccess } from '../../../../lib/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    const order = findById<PurchaseOrder>('procurement-orders', tenantId, id);
    if (!order) return res.status(404).json({ data: null, error: 'Not found' });
    return res.status(200).json(apiSuccess(order));
  }

  if (req.method === 'PATCH') {
    const order = findById<PurchaseOrder>('procurement-orders', tenantId, id);
    if (!order) return res.status(404).json({ data: null, error: 'Not found' });
    const updated = { ...order, ...req.body, id, tenantId, updatedAt: new Date().toISOString() };
    upsertItem('procurement-orders', tenantId, updated);
    return res.status(200).json(apiSuccess(updated));
  }

  if (req.method === 'DELETE') {
    removeItem('procurement-orders', tenantId, id);
    return res.status(200).json(apiSuccess({ deleted: true }));
  }

  return res.status(405).end();
}
