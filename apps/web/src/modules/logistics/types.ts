export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
export type ShipmentType = 'INBOUND' | 'OUTBOUND' | 'RETURN' | 'INTERNAL';
export type VehicleStatus = 'AVAILABLE' | 'ON_ROUTE' | 'MAINTENANCE' | 'INACTIVE';
export type VehicleType = 'TRUCK' | 'VAN' | 'PICKUP' | 'CRANE' | 'FORKLIFT' | 'EXCAVATOR';

export interface Shipment {
  id: string; tenantId: string; trackingNumber: string; carrier: string;
  type: ShipmentType; status: ShipmentStatus;
  origin: string; destination: string;
  estimatedArrival: string; actualArrival?: string;
  items: number; weight: string;
  vehicleId?: string; driverName?: string;
  createdAt: string; updatedAt: string;
}

export interface Vehicle {
  id: string; tenantId: string; plateNumber: string; type: VehicleType;
  brand: string; model: string; year: number;
  status: VehicleStatus; currentLocation: string;
  driverName?: string; driverId?: string;
  nextMaintenanceDate: string; capacity: number; capacityUnit: string;
  createdAt: string; updatedAt: string;
}
