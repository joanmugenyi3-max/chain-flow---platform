export type WorkflowType =
  | 'purchase_order_approval'
  | 'logistics_dispatch_approval'
  | 'contract_approval'
  | 'incident_closure';

export type WorkflowStatus =
  | 'PENDING_SUBMISSION'
  | 'PENDING_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type WorkflowAction = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL';

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStatus;
  actorId?: string;
  actorName?: string;
  comment?: string;
  actedAt?: string;
  requiredRole?: string;
}

export interface WorkflowInstance {
  id: string;
  tenantId: string;
  type: WorkflowType;
  entityId: string;
  entityRef: string;
  entityModule: string;
  entityTitle: string;
  currentStep: number;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requestedById: string;
  requestedByName: string;
  amount?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Actor {
  id: string;
  name: string;
  role: string;
}

export class WorkflowTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowTransitionError';
  }
}
