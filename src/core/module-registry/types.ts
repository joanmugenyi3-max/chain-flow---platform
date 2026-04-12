export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'MINING_ENTERPRISE';
export type WorkflowType = 'purchase_order_approval' | 'logistics_dispatch_approval' | 'contract_approval' | 'incident_closure';

export interface ModuleFeatureFlag {
  id: string;
  label: string;
  requiredPlan: PlanTier;
}

export interface ModuleManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  color: string;
  href: string;
  navOrder: number;
  requiredPlan: PlanTier;
  allowedPlans: PlanTier[];
  isAddOn: boolean;
  addOnPriceMonthly?: number;
  features: ModuleFeatureFlag[];
  workflowTypes: WorkflowType[];
  category: 'core' | 'operations' | 'specialized' | 'analytics';
  tags: string[];
  stats?: string;
}

export type ModuleRegistry = Record<string, ModuleManifest>;

export interface TenantModuleConfig {
  tenantId: string;
  enabledModuleIds: string[];
  addOnModuleIds: string[];
  moduleSettings: Record<string, Record<string, unknown>>;
  updatedAt: string;
}
