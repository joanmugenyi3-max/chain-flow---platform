import type { ModuleManifest } from '../../core/module-registry/types';

export const procurementManifest: ModuleManifest = {
  id: 'procurement',
  name: 'Procurement',
  description: 'End-to-end purchase order management, supplier relationships, and contract lifecycle management.',
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
  features: [
    { id: 'purchase_orders', label: 'Purchase Orders', requiredPlan: 'STARTER' },
    { id: 'supplier_management', label: 'Supplier Management', requiredPlan: 'STARTER' },
    { id: 'contract_lifecycle', label: 'Contract Lifecycle', requiredPlan: 'PROFESSIONAL' },
    { id: 'spend_analytics', label: 'Spend Analytics', requiredPlan: 'PROFESSIONAL' },
  ],
  workflowTypes: ['purchase_order_approval', 'contract_approval'],
};
