import React from 'react';
import type { ModuleManifest, PlanTier, TenantModuleConfig } from '../module-registry/types';

export interface TenantUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
}

export interface TenantContextValue {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  plan: PlanTier;
  industry: string;
  currency: string;
  timezone: string;
  user: TenantUser;
  enabledModules: ModuleManifest[];
  moduleConfig: TenantModuleConfig | null;
  canAccessModule: (moduleId: string) => boolean;
  canUseFeature: (moduleId: string, featureId: string) => boolean;
  isLoading: boolean;
  refetch: () => void;
}

export const TenantContext = React.createContext<TenantContextValue>({
  tenantId: 'demo',
  tenantName: 'Loading...',
  tenantSlug: 'demo',
  plan: 'MINING_ENTERPRISE',
  industry: 'Mining',
  currency: 'USD',
  timezone: 'UTC',
  user: { id: '', fullName: '', email: '', role: '', initials: '??', avatarColor: '#64748b' },
  enabledModules: [],
  moduleConfig: null,
  canAccessModule: () => false,
  canUseFeature: () => false,
  isLoading: true,
  refetch: () => {},
});
