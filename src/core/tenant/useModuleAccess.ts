import { useContext } from 'react';
import { TenantContext } from './TenantContext';

export function useModuleAccess(moduleId: string) {
  const { canAccessModule, canUseFeature, enabledModules, plan } = useContext(TenantContext);
  const module = enabledModules.find(m => m.id === moduleId);
  return {
    canAccess: canAccessModule(moduleId),
    canUseFeature: (featureId: string) => canUseFeature(moduleId, featureId),
    module,
    plan,
  };
}
