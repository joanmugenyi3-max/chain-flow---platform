import React, { useState, useEffect, useCallback } from 'react';
import { TenantContext } from './TenantContext';
import type { TenantContextValue } from './TenantContext';
import type { ModuleManifest, TenantModuleConfig, PlanTier } from '../module-registry/types';
import { planIncludes } from '../module-registry/plan-gates';
import { DEFAULT_TENANT_ID } from '../../lib/constants';

interface TenantApiResponse {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  plan: PlanTier;
  industry: string;
  currency: string;
  timezone: string;
  user: TenantContextValue['user'];
  enabledModules: ModuleManifest[];
  moduleConfig: TenantModuleConfig;
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TenantApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContext = useCallback(async () => {
    try {
      setIsLoading(true);
      const tenantId = DEFAULT_TENANT_ID;
      const res = await fetch(`/api/tenant/context?tenantId=${tenantId}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      console.error('Failed to load tenant context', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchContext(); }, [fetchContext]);

  const canAccessModule = useCallback((moduleId: string): boolean => {
    if (!data) return false;
    return data.enabledModules.some(m => m.id === moduleId);
  }, [data]);

  const canUseFeature = useCallback((moduleId: string, featureId: string): boolean => {
    if (!data) return false;
    const mod = data.enabledModules.find(m => m.id === moduleId);
    if (!mod) return false;
    const feature = mod.features.find(f => f.id === featureId);
    if (!feature) return false;
    return planIncludes(data.plan, feature.requiredPlan);
  }, [data]);

  const value: TenantContextValue = {
    tenantId: data?.tenantId ?? DEFAULT_TENANT_ID,
    tenantName: data?.tenantName ?? 'Loading...',
    tenantSlug: data?.tenantSlug ?? 'demo',
    plan: data?.plan ?? 'MINING_ENTERPRISE',
    industry: data?.industry ?? 'Mining',
    currency: data?.currency ?? 'USD',
    timezone: data?.timezone ?? 'UTC',
    user: data?.user ?? { id: '', fullName: 'User', email: '', role: 'ADMIN', initials: 'JO', avatarColor: '#2563eb' },
    enabledModules: data?.enabledModules ?? [],
    moduleConfig: data?.moduleConfig ?? null,
    canAccessModule,
    canUseFeature,
    isLoading,
    refetch: fetchContext,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
