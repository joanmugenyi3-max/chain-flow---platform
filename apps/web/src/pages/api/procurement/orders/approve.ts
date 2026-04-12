import type { NextApiRequest, NextApiResponse } from 'next';
import { findById, upsertItem, readCollection } from '../../../../core/persistence/fileStore';
import { transition, createWorkflow } from '../../../../core/workflow/engine';
import type { WorkflowInstance } from '../../../../core/workflow/types';
import type { PurchaseOrder } from './index';
import { apiSuccess } from '../../../../lib/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';
  const { id, action, comment } = req.body as { id: string; action: 'APPROVE' | 'REJECT'; comment?: string };

  const order = findById<PurchaseOrder>('procurement-orders', tenantId, id);
  if (!order) return res.status(404).json({ data: null, error: 'Order not found' });

  const actor = { id: 'user-001', name: 'JoeObscura', role: 'ADMIN' };

  // Find or create workflow
  const workflows = readCollection<WorkflowInstance>('workflows', tenantId);
  let workflow = workflows.find(w => w.entityId === id);

  if (!workflow) {
    workflow = createWorkflow({
      id: `wf-${Date.now()}`,
      tenantId,
      type: 'purchase_order_approval',
      entityId: id,
      entityRef: order.number,
      entityModule: 'procurement',
      entityTitle: `${order.number} — ${order.supplierName}`,
      requestedById: actor.id,
      requestedByName: actor.name,
      amount: order.amount,
      currency: order.currency,
    });
  }

  try {
    const updated = transition(workflow, action, actor, comment);
    upsertItem('workflows', tenantId, updated);

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updatedOrder = { ...order, status: newStatus, workflowId: updated.id, updatedAt: new Date().toISOString() };
    upsertItem('procurement-orders', tenantId, updatedOrder);

    return res.status(200).json(apiSuccess({ order: updatedOrder, workflow: updated }));
  } catch (e) {
    return res.status(400).json({ data: null, error: (e as Error).message });
  }
}
