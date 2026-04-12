import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../../../core/tenant/useTenant';
import type { InventoryItem } from '../types';

export function useInventory(filter?: string) {
  const { tenantId } = useTenant();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'LOW' ? '?status=LOW' : '';
      const res = await window.fetch(`/api/inventory/items${params}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [tenantId, filter]);

  useEffect(() => { fetch(); }, [fetch]);
  return { items, loading, refetch: fetch };
}
