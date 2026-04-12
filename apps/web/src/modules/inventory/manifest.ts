import type { ModuleManifest } from '../../core/module-registry/types';

export const inventoryManifest: ModuleManifest = {
  id: 'inventory',
  name: 'Inventory',
  description: 'Multi-warehouse stock management, movement tracking, and automated reorder alerts.',
  icon: '📦',
  version: '1.0.0',
  color: '#10b981',
  href: '/inventory',
  navOrder: 3,
  requiredPlan: 'STARTER',
  allowedPlans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  isAddOn: false,
  category: 'operations',
  tags: ['stock', 'warehouse', 'movements', 'sku'],
  features: [
    { id: 'stock_tracking', label: 'Stock Tracking', requiredPlan: 'STARTER' },
    { id: 'warehouse_management', label: 'Warehouse Management', requiredPlan: 'STARTER' },
    { id: 'movement_history', label: 'Movement History', requiredPlan: 'PROFESSIONAL' },
    { id: 'demand_forecasting', label: 'Demand Forecasting', requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: [],
};
