import type { ModuleManifest, ModuleRegistry } from './types';

const analytics: ModuleManifest = {
  id: 'analytics',
  name: 'Analytics',
  description: 'Real-time KPIs, performance dashboards, and AI-powered insights across all operations.',
  icon: '📊',
  version: '1.0.0',
  color: '#2563eb',
  href: '/analytics',
  navOrder: 1,
  requiredPlan: 'STARTER',
  allowedPlans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  isAddOn: false,
  category: 'analytics',
  tags: ['kpi', 'reports', 'dashboards'],
  stats: 'Live data',
  features: [
    { id: 'basic_kpis', label: 'Basic KPIs', requiredPlan: 'STARTER' },
    { id: 'ai_insights', label: 'AI Insights', requiredPlan: 'PROFESSIONAL' },
    { id: 'custom_reports', label: 'Custom Reports', requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: [],
};

const procurement: ModuleManifest = {
  id: 'procurement',
  name: 'Procurement',
  description: 'End-to-end purchase order management, supplier relationships, and contract lifecycle.',
  icon: '🛒',
  version: '1.0.0',
  color: '#7c3aed',
  href: '/procurement',
  navOrder: 2,
  requiredPlan: 'STARTER',
  allowedPlans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  isAddOn: false,
  category: 'operations',
  tags: ['po', 'suppliers', 'contracts', 'clm'],
  stats: '1 pending approval',
  features: [
    { id: 'purchase_orders', label: 'Purchase Orders', requiredPlan: 'STARTER' },
    { id: 'supplier_management', label: 'Supplier Management', requiredPlan: 'STARTER' },
    { id: 'contract_lifecycle', label: 'Contract Lifecycle', requiredPlan: 'PROFESSIONAL' },
    { id: 'spend_analytics', label: 'Spend Analytics', requiredPlan: 'PROFESSIONAL' },
  ],
  workflowTypes: ['purchase_order_approval', 'contract_approval'],
};

const inventory: ModuleManifest = {
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
  stats: '3 low-stock alerts',
  features: [
    { id: 'stock_tracking', label: 'Stock Tracking', requiredPlan: 'STARTER' },
    { id: 'warehouse_management', label: 'Warehouse Management', requiredPlan: 'STARTER' },
    { id: 'movement_history', label: 'Movement History', requiredPlan: 'PROFESSIONAL' },
    { id: 'demand_forecasting', label: 'Demand Forecasting', requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: [],
};

const logistics: ModuleManifest = {
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
  stats: '14 active shipments',
  features: [
    { id: 'shipment_tracking', label: 'Shipment Tracking', requiredPlan: 'PROFESSIONAL' },
    { id: 'fleet_management', label: 'Fleet Management', requiredPlan: 'PROFESSIONAL' },
    { id: 'route_optimization', label: 'Route Optimization', requiredPlan: 'ENTERPRISE' },
    { id: 'live_gps', label: 'Live GPS Tracking', requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: ['logistics_dispatch_approval'],
};

const mining: ModuleManifest = {
  id: 'mining',
  name: 'Mining',
  description: 'Specialized IoT telemetry, ore extraction tracking, safety management, and ESG reporting for mining operations.',
  icon: '⛏️',
  version: '1.0.0',
  color: '#f97316',
  href: '/mining',
  navOrder: 5,
  requiredPlan: 'MINING_ENTERPRISE',
  allowedPlans: ['MINING_ENTERPRISE'],
  isAddOn: true,
  addOnPriceMonthly: 499,
  category: 'specialized',
  tags: ['iot', 'extraction', 'safety', 'esg', 'equipment'],
  stats: '6 equipment online',
  features: [
    { id: 'iot_telemetry', label: 'IoT Telemetry', requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'extraction_tracking', label: 'Extraction Tracking', requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'safety_management', label: 'Safety Management', requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'esg_reporting', label: 'ESG Reporting', requiredPlan: 'MINING_ENTERPRISE' },
  ],
  workflowTypes: ['incident_closure'],
};

export const MODULE_REGISTRY: ModuleRegistry = {
  analytics,
  procurement,
  inventory,
  logistics,
  mining,
};

export const ORDERED_MODULES: ModuleManifest[] = Object.values(MODULE_REGISTRY).sort(
  (a, b) => a.navOrder - b.navOrder
);

export function getModule(id: string): ModuleManifest | undefined {
  return MODULE_REGISTRY[id];
}

export function getModulesByPlan(plan: import('./types').PlanTier): ModuleManifest[] {
  const { planIncludes } = require('./plan-gates');
  return ORDERED_MODULES.filter(m => planIncludes(plan, m.requiredPlan));
}
