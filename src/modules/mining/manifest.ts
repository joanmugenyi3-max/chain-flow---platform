import type { ModuleManifest } from '../../core/module-registry/types';

export const miningManifest: ModuleManifest = {
  id: 'mining',
  name: 'Mining',
  description: 'Specialized IoT telemetry, ore extraction tracking, safety management, and ESG reporting.',
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
  features: [
    { id: 'iot_telemetry', label: 'IoT Telemetry', requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'extraction_tracking', label: 'Extraction Tracking', requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'safety_management', label: 'Safety Management', requiredPlan: 'MINING_ENTERPRISE' },
    { id: 'esg_reporting', label: 'ESG Reporting', requiredPlan: 'MINING_ENTERPRISE' },
  ],
  workflowTypes: ['incident_closure'],
};
