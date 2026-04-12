import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../../../core/tenant/useTenant';

export interface KpiData {
  procurement: { totalSpend: number; pendingApproval: number; supplierCount: number };
  inventory: { inventoryValue: number; lowStockAlerts: number; totalSkus: number };
  logistics: { activeShipments: number; delayedShipments: number; otdRate: number };
  overall: { score: number; alerts: number };
}

export function useKpis() {
  const { tenantId } = useTenant();
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await window.fetch('/api/analytics/kpis', {
        headers: { 'x-tenant-id': tenantId },
      });
      const json = await res.json();
      setKpis(json.data);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { kpis, loading, refetch: fetch };
}
