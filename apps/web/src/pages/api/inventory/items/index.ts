import type { NextApiRequest, NextApiResponse } from 'next';
import { readCollection, upsertItem, generateId } from '../../../../core/persistence/fileStore';
import { apiSuccess } from '../../../../lib/api';

export interface InventoryItem {
  id: string; tenantId: string; sku: string; name: string; category: string;
  warehouseId: string; warehouseName: string; stock: number; reorderPoint: number;
  maxStock: number; unitCost: number; currency: string; status: string;
  lastMovement: string; createdAt: string; updatedAt: string;
}

function seed(tenantId: string): InventoryItem[] {
  const now = new Date().toISOString();
  return [
    { id: 'inv-001', tenantId, sku: 'DRL-BIT-12', name: 'Drill Bit 12"', category: 'Equipment Parts', warehouseId: 'wh-001', warehouseName: 'WH-Nord', stock: 48, reorderPoint: 20, maxStock: 100, unitCost: 124, currency: 'USD', status: 'IN_STOCK', lastMovement: '2026-04-10', createdAt: now, updatedAt: now },
    { id: 'inv-002', tenantId, sku: 'EXP-ANF-50', name: 'ANFO Explosive 50kg', category: 'Explosives', warehouseId: 'wh-002', warehouseName: 'WH-Sud', stock: 12, reorderPoint: 30, maxStock: 120, unitCost: 89, currency: 'USD', status: 'LOW_STOCK', lastMovement: '2026-04-09', createdAt: now, updatedAt: now },
    { id: 'inv-003', tenantId, sku: 'SAF-HELM-L', name: 'Safety Helmet (Large)', category: 'Safety Gear', warehouseId: 'wh-001', warehouseName: 'WH-Nord', stock: 200, reorderPoint: 50, maxStock: 400, unitCost: 18, currency: 'USD', status: 'IN_STOCK', lastMovement: '2026-04-09', createdAt: now, updatedAt: now },
    { id: 'inv-004', tenantId, sku: 'LUB-ENG-20L', name: 'Engine Lubricant 20L', category: 'Consumables', warehouseId: 'wh-003', warehouseName: 'WH-Est', stock: 6, reorderPoint: 25, maxStock: 80, unitCost: 45, currency: 'USD', status: 'CRITICAL', lastMovement: '2026-04-09', createdAt: now, updatedAt: now },
    { id: 'inv-005', tenantId, sku: 'CONV-BELT-A', name: 'Conveyor Belt Type A', category: 'Equipment Parts', warehouseId: 'wh-002', warehouseName: 'WH-Sud', stock: 4, reorderPoint: 2, maxStock: 10, unitCost: 1200, currency: 'USD', status: 'IN_STOCK', lastMovement: '2026-04-08', createdAt: now, updatedAt: now },
    { id: 'inv-006', tenantId, sku: 'PUMP-SEAL-B', name: 'Pump Seal Set B', category: 'Equipment Parts', warehouseId: 'wh-003', warehouseName: 'WH-Est', stock: 3, reorderPoint: 10, maxStock: 40, unitCost: 340, currency: 'USD', status: 'LOW_STOCK', lastMovement: '2026-04-08', createdAt: now, updatedAt: now },
  ];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';

  if (req.method === 'GET') {
    let items = readCollection<InventoryItem>('inventory-items', tenantId);
    if (items.length === 0) {
      items = seed(tenantId);
      items.forEach(i => upsertItem('inventory-items', tenantId, i));
    }
    const { status } = req.query;
    if (status === 'LOW') items = items.filter(i => i.status !== 'IN_STOCK');
    return res.status(200).json(apiSuccess(items, { total: items.length }));
  }

  if (req.method === 'POST') {
    const now = new Date().toISOString();
    const item: InventoryItem = { ...req.body, id: generateId('inv'), tenantId, createdAt: now, updatedAt: now };
    upsertItem('inventory-items', tenantId, item);
    return res.status(201).json(apiSuccess(item));
  }

  return res.status(405).end();
}
