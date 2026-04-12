import type { WorkflowInstance, WorkflowAction, WorkflowStatus, Actor } from './types';
import { WorkflowTransitionError } from './types';

// Valid transitions: currentStatus → action → nextStatus
const TRANSITIONS: Record<WorkflowStatus, Partial<Record<WorkflowAction, WorkflowStatus>>> = {
  PENDING_SUBMISSION: {
    SUBMIT: 'PENDING_REVIEW',
    CANCEL: 'CANCELLED',
  },
  PENDING_REVIEW: {
    APPROVE: 'PENDING_APPROVAL',
    REJECT: 'REJECTED',
    CANCEL: 'CANCELLED',
  },
  PENDING_APPROVAL: {
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    CANCEL: 'CANCELLED',
  },
  APPROVED: {},
  REJECTED: {
    SUBMIT: 'PENDING_REVIEW', // allow resubmission after rejection
  },
  CANCELLED: {},
};

export function transition(
  instance: WorkflowInstance,
  action: WorkflowAction,
  actor: Actor,
  comment?: string
): WorkflowInstance {
  const nextStatus = TRANSITIONS[instance.status]?.[action];
  if (!nextStatus) {
    throw new WorkflowTransitionError(
      `Cannot perform action "${action}" on workflow in status "${instance.status}"`
    );
  }

  const now = new Date().toISOString();
  const updatedSteps = instance.steps.map((step, idx) => {
    if (idx === instance.currentStep) {
      return {
        ...step,
        status: nextStatus,
        actorId: actor.id,
        actorName: actor.name,
        comment,
        actedAt: now,
      };
    }
    return step;
  });

  const nextStep =
    nextStatus === 'PENDING_APPROVAL'
      ? instance.currentStep + 1
      : instance.currentStep;

  return {
    ...instance,
    status: nextStatus,
    currentStep: Math.min(nextStep, instance.steps.length - 1),
    steps: updatedSteps,
    updatedAt: now,
  };
}

export function createWorkflow(
  params: {
    id: string;
    tenantId: string;
    type: WorkflowInstance['type'];
    entityId: string;
    entityRef: string;
    entityModule: string;
    entityTitle: string;
    requestedById: string;
    requestedByName: string;
    priority?: WorkflowInstance['priority'];
    amount?: number;
    currency?: string;
    dueDate?: string;
  }
): WorkflowInstance {
  const now = new Date().toISOString();
  return {
    ...params,
    priority: params.priority ?? 'MEDIUM',
    currentStep: 0,
    status: 'PENDING_REVIEW',
    steps: [
      { id: 'step-1', label: 'Manager Review', status: 'PENDING_REVIEW', requiredRole: 'MANAGER' },
      { id: 'step-2', label: 'Final Approval', status: 'PENDING_SUBMISSION', requiredRole: 'ADMIN' },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function getStatusLabel(status: WorkflowStatus): string {
  const labels: Record<WorkflowStatus, string> = {
    PENDING_SUBMISSION: 'Draft',
    PENDING_REVIEW: 'Pending Review',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
  };
  return labels[status];
}

export function getStatusColor(status: WorkflowStatus): string {
  const colors: Record<WorkflowStatus, string> = {
    PENDING_SUBMISSION: '#94a3b8',
    PENDING_REVIEW: '#f59e0b',
    PENDING_APPROVAL: '#3b82f6',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
    CANCELLED: '#6b7280',
  };
  return colors[status];
}
