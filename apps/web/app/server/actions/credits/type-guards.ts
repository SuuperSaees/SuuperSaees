import { Credit, CreditOperations } from "~/lib/credit.types";

// Unified history type for all credit operation changes
export interface CreditOperationHistoryEntry {
  oldQuantity: number;
  newQuantity: number;
  remaining: number;
  changedAt: string;
  changedBy: string;
  description?: string;
  type: 'user' | 'system';
  status: 'consumed' | 'purchased' | 'refunded' | 'locked' | 'expired';
  operationType: 'update' | 'remove';
}

// Type guards for Credit Operation History
export function isCreditOperationHistoryEntry(value: unknown): value is CreditOperationHistoryEntry {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof obj.oldQuantity === 'number' &&
    typeof obj.newQuantity === 'number' &&
    typeof obj.changedAt === 'string' &&
    typeof obj.changedBy === 'string' &&
    (obj.description === undefined || typeof obj.description === 'string') &&
    (obj.type === 'user' || obj.type === 'system') &&
    isCreditOperationStatus(obj.status) &&
    (obj.operationType === 'update' || obj.operationType === 'remove')
  );
}

// Type guards for Credit Operations
export function isCreditOperationStatus(value: unknown): value is CreditOperations.Enums.Status {
  return typeof value === 'string' && 
    Object.values(CreditOperations.Enums.Status).includes(value as CreditOperations.Enums.Status);
}

export function isCreditOperationType(value: unknown): value is CreditOperations.Enums.Type {
  return typeof value === 'string' && 
    Object.values(CreditOperations.Enums.Type).includes(value as CreditOperations.Enums.Type);
}

export function isCreditOperationInsert(value: unknown): value is CreditOperations.Insert {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof obj.actor_id === 'string' &&
    isCreditOperationStatus(obj.status) &&
    isCreditOperationType(obj.type) &&
    typeof obj.quantity === 'number' &&
    typeof obj.credit_id === 'string' &&
    (obj.description === undefined || typeof obj.description === 'string') &&
    (obj.metadata === undefined || obj.metadata === null || typeof obj.metadata === 'object')
  );
}

export function isCreditOperationUpdate(value: unknown): value is CreditOperations.Update {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    (obj.id === undefined || typeof obj.id === 'string') &&
    (obj.actor_id === undefined || typeof obj.actor_id === 'string') &&
    (obj.status === undefined || isCreditOperationStatus(obj.status)) &&
    (obj.type === undefined || isCreditOperationType(obj.type)) &&
    (obj.quantity === undefined || typeof obj.quantity === 'number') &&
    (obj.credit_id === undefined || typeof obj.credit_id === 'string') &&
    (obj.description === undefined || typeof obj.description === 'string') &&
    (obj.metadata === undefined || obj.metadata === null || typeof obj.metadata === 'object')
  );
}

// Type guards for Credits
export function isCreditInsert(value: unknown): value is Credit.Insert {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof obj.agency_id === 'string' &&
    typeof obj.client_organization_id === 'string' &&
    (obj.balance === undefined || typeof obj.balance === 'number') &&
    (obj.user_id === undefined || typeof obj.user_id === 'string' || obj.user_id === null)
  );
}

export function isCreditUpdate(value: unknown): value is Credit.Update {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    (obj.id === undefined || typeof obj.id === 'string') &&
    (obj.agency_id === undefined || typeof obj.agency_id === 'string') &&
    (obj.client_organization_id === undefined || typeof obj.client_organization_id === 'string') &&
    (obj.balance === undefined || typeof obj.balance === 'number') &&
    (obj.user_id === undefined || typeof obj.user_id === 'string' || obj.user_id === null)
  );
}

export function isCreditRequestCreate(value: unknown): value is Credit.Request.Create {
  const obj = value as Record<string, unknown>;
  return (
    isCreditInsert(value) &&
    (obj.credit_operations === undefined || 
     obj.credit_operations === null || 
     (Array.isArray(obj.credit_operations) && 
      obj.credit_operations.every(op => isCreditOperationInsert(op))))
  );
}

export function isCreditRequestUpdate(value: unknown): value is Credit.Request.Update {
  const obj = value as Record<string, unknown>;
  return (
    isCreditUpdate(value) &&
    (obj.credit_operations === undefined || 
     obj.credit_operations === null || 
     (Array.isArray(obj.credit_operations) && 
      obj.credit_operations.every(op => isCreditOperationUpdate(op))))
  );
}

export function isCreditRequestRemove(value: unknown): value is Credit.Request.Remove {
  const obj = value as Record<string, unknown>;
  return (
    typeof value === 'object' &&
    value !== null &&
    (obj.id === undefined || typeof obj.id === 'string') &&
    (obj.client_organization_id === undefined || typeof obj.client_organization_id === 'string') &&
    Array.isArray(obj.credit_operations) &&
    obj.credit_operations.length > 0 &&
    obj.credit_operations.every((op: unknown) => isCreditOperationInsert(op))
  );
}

// Helper functions for validation
export function validateCreditOperation(operation: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isCreditOperationInsert(operation)) {
    errors.push('Invalid credit operation structure');
  }
  
  const obj = operation as Record<string, unknown>;
  
  if (typeof obj.quantity === 'number' && obj.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (typeof obj.actor_id === 'string' && !obj.actor_id.trim()) {
    errors.push('Actor ID is required');
  }
  
  if (typeof obj.credit_id === 'string' && !obj.credit_id.trim()) {
    errors.push('Credit ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCredit(credit: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isCreditInsert(credit)) {
    errors.push('Invalid credit structure');
  }
  
  const obj = credit as Record<string, unknown>;
  
  if (typeof obj.agency_id === 'string' && !obj.agency_id.trim()) {
    errors.push('Agency ID is required');
  }
  
  if (typeof obj.client_organization_id === 'string' && !obj.client_organization_id.trim()) {
    errors.push('Client organization ID is required');
  }
  
  if (typeof obj.balance === 'number' && obj.balance < 0) {
    errors.push('Balance cannot be negative on creation');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
