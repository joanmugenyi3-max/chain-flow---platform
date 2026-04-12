import type { ModuleManifest } from '../../core/module-registry/types';

export const logisticsManifest: ModuleManifest = {
  id: 'logistics',
  name: 'Logistics',
  description: 'Real-time shipment tracking, fleet management, GPS monitoring, and route optimization.',
  icon: '🚛',
  version: '1.0.0',
  color: '#0ea5e9',
  href: '/logistics',
  navOrder: 4,
  requiredPlan: 'PROFESSIONAL',
  allowedPlans: ['PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  isAddOn: true,
  addOnPriceMonthly: 149,
  category: 'operations',
  tags: ['shipments', 'fleet', 'routes', 'tracking'],
  features: [
    { id: 'shipment_tracking', label: 'Shipment Tracking', requiredPlan: 'PROFESSIONAL' },
    { id: 'fleet_management', label: 'Fleet Management', requiredPlan: 'PROFESSIONAL' },
    { id: 'route_optimization', label: 'Route Optimization', requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: ['logistics_dispatch_approval'],
};
