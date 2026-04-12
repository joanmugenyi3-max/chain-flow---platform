// ─────────────────────────────────────────────────────────────────────────────
// Module Registry — Central manifest declarations
// To add a new module: create a manifest object below and add it to MODULE_REGISTRY.
// No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import type { ModuleManifest, ModuleRegistry, PlanTier } from './types';
import { planIncludes } from './plan-gates';

// ── Module manifests ──────────────────────────────────────────────────────────

const analytics: ModuleManifest = {
  // Identity
  id: 'analytics',
  name: 'Analytics',
  description: 'Real-time KPIs, performance dashboards, and AI-powered insights across all operations.',
  icon: '📊',
  version: '1.0.0',
  status: 'stable',
  // Navigation
  href: '/analytics',
  navOrder: 1,
  color: '#2563eb',
  // Access control
  requiredPlan: 'STARTER',
  allowedPlans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  accessTier: 'free',
  isAddOn: false,
  // Classification
  category: 'analytics',
  industries: ['mining', 'manufacturing', 'agriculture', 'health', 'finance', 'retail', 'logistics', 'construction', 'energy', 'generic'],
  tags: ['kpi', 'reports', 'dashboards'],
  // Dependencies
  dependencies: [],
  // Features
  features: [
    { id: 'basic_kpis',      label: 'Basic KPIs',      requiredPlan: 'STARTER' },
    { id: 'ai_insights',     label: 'AI Insights',     requiredPlan: 'PROFESSIONAL' },
    { id: 'custom_reports',  label: 'Custom Reports',  requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: [],
  stats: 'Live data',
};

const procurement: ModuleManifest = {
  id: 'procurement',
  name: 'Procurement',
  description: 'End-to-end purchase order management, supplier relationships, and contract lifecycle.',
  icon: '🛒',
  version: '1.0.0',
  status: 'stable',
  href: '/procurement',
  navOrder: 2,
  color: '#7c3aed',
  requiredPlan: 'STARTER',
  allowedPlans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  accessTier: 'free',
  isAddOn: false,
  category: 'operations',
  industries: ['mining', 'manufacturing', 'agriculture', 'health', 'finance', 'retail', 'logistics', 'construction', 'energy', 'generic'],
  tags: ['po', 'suppliers', 'contracts', 'clm'],
  dependencies: [],
  enhances: ['analytics'],
  features: [
    { id: 'purchase_orders',      label: 'Purchase Orders',      requiredPlan: 'STARTER' },
    { id: 'supplier_management',  label: 'Supplier Management',  requiredPlan: 'STARTER' },
    { id: 'contract_lifecycle',   label: 'Contract Lifecycle',   requiredPlan: 'PROFESSIONAL' },
    { id: 'spend_analytics',      label: 'Spend Analytics',      requiredPlan: 'PROFESSIONAL' },
  ],
  workflowTypes: ['purchase_order_approval', 'contract_approval'],
  stats: '1 pending approval',
};

const inventory: ModuleManifest = {
  id: 'inventory',
  name: 'Inventory',
  description: 'Multi-warehouse stock management, movement tracking, and automated reorder alerts.',
  icon: '📦',
  version: '1.0.0',
  status: 'stable',
  href: '/inventory',
  navOrder: 3,
  color: '#10b981',
  requiredPlan: 'STARTER',
  allowedPlans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  accessTier: 'free',
  isAddOn: false,
  category: 'operations',
  industries: ['mining', 'manufacturing', 'agriculture', 'health', 'retail', 'logistics', 'construction', 'energy', 'generic'],
  tags: ['stock', 'warehouse', 'movements', 'sku'],
  dependencies: [],
  enhances: ['analytics', 'procurement'],
  features: [
    { id: 'stock_tracking',       label: 'Stock Tracking',       requiredPlan: 'STARTER' },
    { id: 'warehouse_management', label: 'Warehouse Management', requiredPlan: 'STARTER' },
    { id: 'movement_history',     label: 'Movement History',     requiredPlan: 'PROFESSIONAL' },
    { id: 'demand_forecasting',   label: 'Demand Forecasting',   requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: [],
  stats: '3 low-stock alerts',
};

const logistics: ModuleManifest = {
  id: 'logistics',
  name: 'Logistics',
  description: 'Real-time shipment tracking, fleet management, GPS monitoring, and route optimization.',
  icon: '🚛',
  version: '1.0.0',
  status: 'stable',
  href: '/logistics',
  navOrder: 4,
  color: '#0ea5e9',
  requiredPlan: 'PROFESSIONAL',
  allowedPlans: ['PROFESSIONAL', 'ENTERPRISE', 'MINING_ENTERPRISE'],
  accessTier: 'premium',
  isAddOn: true,
  addOnPriceMonthly: 149,
  addOnPriceYearly: 119,
  category: 'operations',
  industries: ['mining', 'manufacturing', 'retail', 'logistics', 'construction', 'energy', 'generic'],
  tags: ['shipments', 'fleet', 'routes', 'tracking'],
  dependencies: ['inventory'],
  enhances: ['analytics', 'procurement'],
  features: [
    { id: 'shipment_tracking',  label: 'Shipment Tracking',  requiredPlan: 'PROFESSIONAL' },
    { id: 'fleet_management',   label: 'Fleet Management',   requiredPlan: 'PROFESSIONAL' },
    { id: 'route_optimization', label: 'Route Optimization', requiredPlan: 'ENTERPRISE' },
    { id: 'live_gps',           label: 'Live GPS Tracking',  requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: ['logistics_dispatch_approval'],
  stats: '14 active shipments',
};

const mining: ModuleManifest = {
  id: 'mining',
  name: 'Mining',
  description: 'Specialized IoT telemetry, ore extraction tracking, safety management, and ESG reporting.',
  icon: '⛏️',
  version: '1.0.0',
  status: 'stable',
  href: '/mining',
  navOrder: 5,
  color: '#f97316',
  requiredPlan: 'MINING_ENTERPRISE',
  allowedPlans: ['MINING_ENTERPRISE'],
  accessTier: 'specialized',
  isAddOn: true,
  addOnPriceMonthly: 499,
  addOnPriceYearly: 399,
  category: 'specialized',
  industries: ['mining'],
  tags: ['iot', 'extraction', 'safety', 'esg', 'equipment'],
  dependencies: ['inventory', 'logistics'],
  enhances: ['analytics'],
  features: [
    { id: 'iot_telemetry',      label: 'IoT Telemetry',      requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'extraction_tracking',label: 'Extraction Tracking', requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'safety_management',  label: 'Safety Management',   requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'esg_reporting',      label: 'ESG Reporting',       requiredPlan: 'MINING_ENTERPRISE' },
  ],
  workflowTypes: ['incident_closure'],
  stats: '6 equipment online',
};

// ── Registry ──────────────────────────────────────────────────────────────────

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

export function getModulesByPlan(plan: PlanTier): ModuleManifest[] {
  return ORDERED_MODULES.filter(m => planIncludes(plan, m.requiredPlan));
}

/** All manifests as an array (ordered) */
export function getAllModules(): ModuleManifest[] {
  return ORDERED_MODULES;
}
