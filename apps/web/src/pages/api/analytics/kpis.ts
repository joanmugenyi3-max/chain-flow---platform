import type { NextApiRequest, NextApiResponse } from 'next';
import { readCollection } from '../../../core/persistence/fileStore';
import { apiSuccess } from '../../../lib/api';
import type { PurchaseOrder } from '../../../modules/procurement/types';
import type { Shipment } from '../../../modules/logistics/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';

  const orders = readCollection<PurchaseOrder>('procurement-orders', tenantId);
  const shipments = readCollection<Shipment>('logistics-shipments', tenantId);
  const items = readCollection<{ stock: number; reorderPoint: number; unitCost: number }>('inventory-items', tenantId);

  const totalSpend = orders.reduce((sum, o) => sum + (o.amount ?? 0), 0);
  const pendingApproval = orders.filter(o => o.status === 'PENDING_APPROVAL').length;
  const activeShipments = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const delayedShipments = shipments.filter(s => s.status === 'DELAYED').length;
  const lowStockAlerts = items.filter(i => i.stock <= i.reorderPoint).length;
  const inventoryValue = items.reduce((sum, i) => sum + (i.stock ?? 0) * (i.unitCost ?? 0), 0);
  const otdRate = shipments.length > 0
    ? ((shipments.filter(s => s.status === 'DELIVERED').length / Math.max(shipments.filter(s => ['DELIVERED', 'DELAYED'].includes(s.status)).length, 1)) * 100).toFixed(1)
    : '0';

  return res.status(200).json(apiSuccess({
    procurement: { totalSpend, pendingApproval, supplierCount: 5 },
    inventory: { inventoryValue, lowStockAlerts, totalSkus: items.length },
    logistics: { activeShipments, delayedShipments, otdRate: parseFloat(otdRate as string) },
    overall: { score: 91, alerts: pendingApproval + lowStockAlerts + delayedShipments },
  }));
}
