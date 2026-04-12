export type POStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'RECEIVED' | 'CANCELLED';
export type POPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TERMINATED';
export type ContractType = 'SUPPLY' | 'SERVICE' | 'NDA' | 'FRAMEWORK' | 'MAINTENANCE';

export interface PurchaseOrder {
  id: string; tenantId: string; number: string;
  supplierId: string; supplierName: string; category: string;
  status: POStatus; priority: POPriority; date: string; dueDate: string;
  amount: number; currency: string; lines: POLine[];
  notes?: string; workflowId?: string;
  createdAt: string; updatedAt: string;
}

export interface POLine {
  id: string; description: string; quantity: number;
  unitPrice: number; unit: string; taxRate: number; total: number;
}

export interface Supplier {
  id: string; tenantId: string; name: string; code: string;
  country: string; category: string; contactName: string;
  contactEmail: string; contactPhone: string;
  rating: number; paymentTerms: string; currency: string;
  status: SupplierStatus; activeContracts: number; ytdSpend: number;
  createdAt: string; updatedAt: string;
}

export interface Contract {
  id: string; tenantId: string; title: string;
  supplierId: string; supplierName: string; type: ContractType;
  status: ContractStatus; value: number; currency: string;
  startDate: string; endDate: string;
  autoRenew: boolean; noticePeriodDays: number;
  createdAt: string; updatedAt: string;
}
