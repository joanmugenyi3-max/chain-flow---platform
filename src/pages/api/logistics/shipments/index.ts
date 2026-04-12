import type { NextApiRequest, NextApiResponse } from 'next';
import { readCollection, upsertItem, generateId } from '../../../../core/persistence/fileStore';
import { apiSuccess } from '../../../../lib/api';

export interface Shipment {
  id: string; tenantId: string; trackingNumber: string; carrier: string;
  type: string; status: string; origin: string; destination: string;
  estimatedArrival: string; actualArrival?: string; items: number; weight: string;
  vehicleId?: string; driverName?: string; createdAt: string; updatedAt: string;
}

function seed(tenantId: string): Shipment[] {
  const now = new Date().toISOString();
  return [
    { id: 'shp-001', tenantId, trackingNumber: 'SHP-1041', carrier: 'TransAfrique', type: 'OUTBOUND', status: 'IN_TRANSIT', origin: 'Warehouse A — Kinshasa', destination: 'Site Nord — Kolwezi', estimatedArrival: '2026-04-11', items: 24, weight: '3.2 t', vehicleId: 'vh-001', driverName: 'Jean Mukeba', createdAt: now, updatedAt: now },
    { id: 'shp-002', tenantId, trackingNumber: 'SHP-1040', carrier: 'FastCargo', type: 'INBOUND', status: 'DELIVERED', origin: 'Supplier CMCK', destination: 'Warehouse B — Lubumbashi', estimatedArrival: '2026-04-09', actualArrival: '2026-04-09', items: 8, weight: '0.9 t', createdAt: now, updatedAt: now },
    { id: 'shp-003', tenantId, trackingNumber: 'SHP-1039', carrier: 'TransAfrique', type: 'OUTBOUND', status: 'DELAYED', origin: 'Warehouse A — Kinshasa', destination: 'Site Sud — Likasi', estimatedArrival: '2026-04-12', items: 15, weight: '2.1 t', vehicleId: 'vh-003', createdAt: now, updatedAt: now },
    { id: 'shp-004', tenantId, trackingNumber: 'SHP-1038', carrier: 'MineLog DRC', type: 'INBOUND', status: 'IN_TRANSIT', origin: 'Supplier KAMOTO', destination: 'Site Nord — Kolwezi', estimatedArrival: '2026-04-10', items: 6, weight: '18.5 t', createdAt: now, updatedAt: now },
    { id: 'shp-005', tenantId, trackingNumber: 'SHP-1037', carrier: 'OceanLink', type: 'OUTBOUND', status: 'PENDING', origin: 'Warehouse C — Likasi', destination: 'Port — Dar es Salaam', estimatedArrival: '2026-04-15', items: 42, weight: '12.0 t', createdAt: now, updatedAt: now },
  ];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'demo';

  if (req.method === 'GET') {
    let items = readCollection<Shipment>('logistics-shipments', tenantId);
    if (items.length === 0) {
      items = seed(tenantId);
      items.forEach(i => upsertItem('logistics-shipments', tenantId, i));
    }
    const { status } = req.query;
    if (status && status !== 'ALL') items = items.filter(s => s.status === status);
    return res.status(200).json(apiSuccess(items, { total: items.length }));
  }

  if (req.method === 'POST') {
    const now = new Date().toISOString();
    const item: Shipment = { ...req.body, id: generateId('shp'), tenantId, createdAt: now, updatedAt: now };
    upsertItem('logistics-shipments', tenantId, item);
    return res.status(201).json(apiSuccess(item));
  }

  return res.status(405).end();
}
