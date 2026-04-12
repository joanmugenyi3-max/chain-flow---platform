import type { NextApiRequest, NextApiResponse } from 'next';
import { readCollection, upsertItem, generateId } from '../../../../core/persistence/fileStore';
import { createWorkflow } from '../../../../core/workflow/engine';
import { upsertItem as upsertWorkflow } from '../../../../core/persistence/fileStore';
import { apiSuccess } from '../../../../lib/api';

export interface PurchaseOrder {
  id: string; tenantId: string; number: string; supplierId: string; supplierName: string;
  category: string; status: string; priority: string; date: string; dueDate: string;
  amount: number; currency: string; lines: POLine[]; notes?: string;
  workflowId?: string; createdAt: string; updatedAt: string;
}
export interface POLine {
  id: string; description: string; quantity: number;
  unitPrice: number; unit: string; taxRate: number; total: number;
}

function seedOrders(tenantId: string): PurchaseOrder[] {
  return [
    { id: 'po-001', tenantId, number: 'PO-2026-0041', supplierId: 'sup-001', supplierName: 'CMCK Mining Supplies', category: 'Equipment Parts', status: 'APPROVED', priority: 'HIGH', date: '2026-04-09', dueDate: '2026-04-20', amount: 48200, currency: 'USD', lines: [{ id: 'l1', description: 'Drill Bit 12"', quantity: 24, unitPrice: 124, unit: 'pcs', taxRate: 16, total: 2976 }], createdAt: '2026-04-09T08:00:00Z', updatedAt: '2026-04-09T10:00:00Z' },
    { id: 'po-002', tenantId, number: 'PO-2026-0040', supplierId: 'sup-002', supplierName: 'African Steel DRC', category: 'Raw Materials', status: 'PENDING_APPROVAL', priority: 'MEDIUM', date: '2026-04-08', dueDate: '2026-04-25', amount: 12750, currency: 'USD', lines: [{ id: 'l2', description: 'Steel Rods 20mm', quantity: 500, unitPrice: 25.5, unit: 'kg', taxRate: 16, total: 12750 }], createdAt: '2026-04-08T09:00:00Z', updatedAt: '2026-04-08T09:00:00Z' },
    { id: 'po-003', tenantId, number: 'PO-2026-0039', supplierId: 'sup-003', supplierName: 'Lubumbashi Tech', category: 'IT Equipment', status: 'SENT', priority: 'LOW', date: '2026-04-07', dueDate: '2026-05-01', amount: 6400, currency: 'USD', lines: [{ id: 'l3', description: 'Laptop Core i7', quantity: 4, unitPrice: 1600, unit: 'pcs', taxRate: 16, total: 6400 }], createdAt: '2026-04-07T10:00:00Z', updatedAt: '2026-04-07T14:00:00Z' },
    { id: 'po-004', tenantId, number: 'PO-2026-0038', supplierId: 'sup-001', supplierName: 'CMCK Mining Supplies', category: 'Consumables', status: 'RECEIVED', priority: 'LOW', date: '2026-04-06', dueDate: '2026-04-15', amount: 3100, currency: 'USD', lines: [{ id: 'l4', description: 'Safety Gloves L', quantity: 200, unitPrice: 15.5, unit: 'pairs', taxRate: 16, total: 3100 }], createdAt: '2026-04-06T08:00:00Z', updatedAt: '2026-04-10T08:00:00Z' },
    { id: 'po-005', tenantId, number: 'PO-2026-0037', supplierId: 'sup-004', supplierName: 'SafetyFirst Africa', category: 'Safety Gear', status: 'APPROVED', priority: 'URGENT', date: '2026-04-05', dueDate: '2026-04-12', amount: 9870, currency: 'USD', lines: [{ id: 'l5', description: 'Hard Hat EN397', quantity: 150, unitPrice: 65.8, unit: 'pcs', taxRate: 16, total: 9870 }], createdAt: '2026-04-05T07:00:00Z', updatedAt: '2026-04-05T11:00:00Z' },
  ];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';

  if (req.method === 'GET') {
    let orders = readCollection<PurchaseOrder>('procurement-orders', tenantId);
    if (orders.length === 0) {
      orders = seedOrders(tenantId);
      orders.forEach(o => upsertItem('procurement-orders', tenantId, o));
    }
    const { status, search } = req.query;
    if (status && status !== 'ALL') orders = orders.filter(o => o.status === status);
    if (search) {
      const s = (search as string).toLowerCase();
      orders = orders.filter(o => o.number.toLowerCase().includes(s) || o.supplierName.toLowerCase().includes(s));
    }
    return res.status(200).json(apiSuccess(orders, { total: orders.length }));
  }

  if (req.method === 'POST') {
    const body = req.body as Partial<PurchaseOrder>;
    const now = new Date().toISOString();
    const count = readCollection<PurchaseOrder>('procurement-orders', tenantId).length;
    const order: PurchaseOrder = {
      id: generateId('po'),
      tenantId,
      number: `PO-2026-${String(count + 42).padStart(4, '0')}`,
      supplierId: body.supplierId ?? '',
      supplierName: body.supplierName ?? '',
      category: body.category ?? 'General',
      status: 'DRAFT',
      priority: body.priority ?? 'MEDIUM',
      date: new Date().toISOString().split('T')[0],
      dueDate: body.dueDate ?? '',
      amount: body.amount ?? 0,
      currency: body.currency ?? 'USD',
      lines: body.lines ?? [],
      notes: body.notes,
      createdAt: now, updatedAt: now,
    };
    upsertItem('procurement-orders', tenantId, order);
    return res.status(201).json(apiSuccess(order));
  }

  return res.status(405).end();
}
