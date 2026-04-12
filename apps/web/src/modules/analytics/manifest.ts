import type { ModuleManifest } from '../../core/module-registry/types';

export const analyticsManifest: ModuleManifest = {
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
  features: [
    { id: 'basic_kpis', label: 'Basic KPIs', requiredPlan: 'STARTER' },
    { id: 'ai_insights', label: 'AI Insights', requiredPlan: 'PROFESSIONAL' },
    { id: 'custom_reports', label: 'Custom Reports', requiredPlan: 'ENTERPRISE' },
  ],
  workflowTypes: [],
};
