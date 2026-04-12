import { useContext } from 'react';
import { TenantContext } from './TenantContext';

export function useTenant() {
  return useContext(TenantContext);
}

export function useCurrentUser() {
  const { user } = useContext(TenantContext);
  return user;
}

export function usePlan() {
  const { plan } = useContext(TenantContext);
  return plan;
}
