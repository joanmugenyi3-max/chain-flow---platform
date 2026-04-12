export const APP_NAME = 'minechain-ai';
export const APP_VERSION = '2.0.0';
export const DEFAULT_TENANT_ID = 'demo';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LOCALE = 'en-US';

export const MODULE_COLORS: Record<string, string> = {
  analytics: '#2563eb',
  procurement: '#7c3aed',
  inventory: '#10b981',
  logistics: '#0ea5e9',
  mining: '#f97316',
};

export const WORKFLOW_STATUS_COLORS: Record<string, string> = {
  PENDING_SUBMISSION: '#94a3b8',
  PENDING_REVIEW: '#f59e0b',
  PENDING_APPROVAL: '#3b82f6',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

export const ITEMS_PER_PAGE = 20;
export const TOAST_DURATION = 3500;
