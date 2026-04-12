import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../../../core/tenant/useTenant';
import type { Shipment } from '../types';

export function useShipments(statusFilter?: string) {
  const { tenantId } = useTenant();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await window.fetch(`/api/logistics/shipments${params}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const json = await res.json();
      setShipments(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [tenantId, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  return { shipments, loading, refetch: fetch };
}
