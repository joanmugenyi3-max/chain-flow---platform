export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK' | 'OVERSTOCK';
export type MovementType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';
export type WarehouseType = 'CENTRAL' | 'REGIONAL' | 'TRANSIT' | 'RETAIL' | 'MINING';

export interface InventoryItem {
  id: string; tenantId: string; sku: string; name: string; category: string;
  warehouseId: string; warehouseName: string; stock: number; reorderPoint: number;
  maxStock: number; unitCost: number; currency: string; status: StockStatus;
  lastMovement: string; createdAt: string; updatedAt: string;
}

export interface Warehouse {
  id: string; tenantId: string; name: string; code: string; type: WarehouseType;
  location: string; city: string; country: string;
  lat?: number; lng?: number;
  totalCapacity: number; usedCapacity: number; capacityUnit: string;
  managerId: string; managerName: string; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface Movement {
  id: string; tenantId: string; type: MovementType;
  productId: string; productName: string; productSku: string;
  sourceWarehouseId?: string; sourceWarehouseName?: string;
  targetWarehouseId?: string; targetWarehouseName?: string;
  quantity: number; unitCost?: number;
  reference: string; reason?: string; notes?: string;
  performedBy: string; createdAt: string;
}
