import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../../../core/tenant/useTenant';
import type { PurchaseOrder } from '../types';

interface UsePurchaseOrdersOptions { status?: string; search?: string; }

export function usePurchaseOrders(options: UsePurchaseOrdersOptions = {}) {
  const { tenantId } = useTenant();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (options.status && options.status !== 'ALL') params.set('status', options.status);
      if (options.search) params.set('search', options.search);
      const res = await window.fetch(`/api/procurement/orders?${params}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const json = await res.json();
      setOrders(json.data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tenantId, options.status, options.search]);

  useEffect(() => { fetch(); }, [fetch]);

  const approve = useCallback(async (id: string, comment?: string) => {
    const res = await window.fetch('/api/procurement/orders/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
      body: JSON.stringify({ id, action: 'APPROVE', comment }),
    });
    const json = await res.json();
    if (json.data) {
      setOrders(prev => prev.map(o => o.id === id ? json.data.order : o));
    }
    return json;
  }, [tenantId]);

  const reject = useCallback(async (id: string, comment?: string) => {
    const res = await window.fetch('/api/procurement/orders/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
      body: JSON.stringify({ id, action: 'REJECT', comment }),
    });
    const json = await res.json();
    if (json.data) {
      setOrders(prev => prev.map(o => o.id === id ? json.data.order : o));
    }
    return json;
  }, [tenantId]);

  return { orders, loading, error, refetch: fetch, approve, reject };
}
