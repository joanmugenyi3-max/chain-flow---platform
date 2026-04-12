import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../../../core/tenant/useTenant';
import type { Supplier } from '../types';

// Demo suppliers — returned until backend supplier API is wired
const DEMO_SUPPLIERS: Supplier[] = [
  { id: 'sup-001', tenantId: 'demo', name: 'CMCK Mining Supplies', code: 'CMCK', country: 'DRC', category: 'Equipment', contactName: 'Pierre K.', contactEmail: 'pk@cmck.cd', contactPhone: '+243810001', rating: 4.7, paymentTerms: 'NET30', currency: 'USD', status: 'ACTIVE', activeContracts: 3, ytdSpend: 198400, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sup-002', tenantId: 'demo', name: 'African Steel DRC', code: 'ASDRC', country: 'DRC', category: 'Materials', contactName: 'Marie N.', contactEmail: 'mn@asdrc.cd', contactPhone: '+243820002', rating: 4.1, paymentTerms: 'NET60', currency: 'USD', status: 'ACTIVE', activeContracts: 1, ytdSpend: 87200, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sup-003', tenantId: 'demo', name: 'Lubumbashi Tech', code: 'LBTECH', country: 'DRC', category: 'IT', contactName: 'André M.', contactEmail: 'am@lbtech.cd', contactPhone: '+243830003', rating: 3.9, paymentTerms: 'NET30', currency: 'USD', status: 'ACTIVE', activeContracts: 1, ytdSpend: 28500, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sup-004', tenantId: 'demo', name: 'SafetyFirst Africa', code: 'SFA', country: 'South Africa', category: 'Safety', contactName: 'Nomsa D.', contactEmail: 'nd@sfa.co.za', contactPhone: '+27110004', rating: 4.8, paymentTerms: 'NET30', currency: 'USD', status: 'ACTIVE', activeContracts: 2, ytdSpend: 45100, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sup-005', tenantId: 'demo', name: 'Kamoto Copper Company', code: 'KCC', country: 'DRC', category: 'Services', contactName: 'Jean K.', contactEmail: 'jk@kcc.cd', contactPhone: '+243850005', rating: 4.5, paymentTerms: 'NET60', currency: 'USD', status: 'ACTIVE', activeContracts: 2, ytdSpend: 112000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];

export function useSuppliers() {
  const [suppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);
  const [loading] = useState(false);
  return { suppliers, loading };
}
