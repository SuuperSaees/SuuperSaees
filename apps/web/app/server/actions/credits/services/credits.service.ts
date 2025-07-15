import { Credit, CreditOperations } from '~/lib/credit.types';
import { CreditRepository } from '../repositories/credits.repository';
import { CreditOperationRepository } from '../repositories/credit-operations.repository';
import { CreditOperationHistory } from '../type-guards';

export class CreditService {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly creditOperationRepository?: CreditOperationRepository,
  ) {}

  // * CREATE SERVICES
  async create(payload: Credit.Request.Create): Promise<Credit.Type> {
    // Validate balance is non-negative for new credits
    if (payload.balance && payload.balance < 0) {
      throw new Error('Initial balance cannot be negative');
    }

    return await this.creditRepository.create(payload);
  }

  // * GET SERVICES
  async list(): Promise<{
    data: CreditOperations.Response[];
    nextCursor: string | null;
    count: number | null;
    pagination: {
      limit: number;
      hasNextPage: boolean;
      totalPages: number | null;
      currentPage: number | null;
      isOffsetBased: boolean;
    };
  }> {
    return await this.creditRepository.list();
  }

  async get(clientOrganizationId?: string): Promise<Credit.Response> {
      return await this.creditRepository.get(clientOrganizationId);
  }

  // * OPERATION SERVICES (Indirect credit modifications)
  async createOperation(payload: Credit.Request.Create): Promise<Credit.Type> {
    if (!this.creditOperationRepository) {
      throw new Error('Credit operation repository is required for operation methods');
    }

    // Extract credit operations and create them
    if (payload.credit_operations && payload.credit_operations.length > 0) {
      // Create the credit first
      const credit = await this.creditRepository.create(payload);
      
      // Then create the operations
      for (const operation of payload.credit_operations) {
        await this.creditOperationRepository.create({
          ...operation,
          credit_id: credit.id,
        });
      }
      
      return credit;
    }

    throw new Error('No credit operations provided for createOperation');
  }

  async updateOperation(payload: Credit.Request.Update): Promise<Credit.Type> {
    if (!this.creditOperationRepository) {
      throw new Error('Credit operation repository is required for operation methods');
    }

    // First, get the current credit to return it at the end
    if (!payload.id) {
      throw new Error('Credit ID is required for update operations');
    }
    
    const currentCredit = await this.creditRepository.getById(payload.id);

    // Handle credit operations if provided
    if (payload.credit_operations && payload.credit_operations.length > 0) {
      for (const operation of payload.credit_operations) {
        if (operation.id) {
          // Get the existing operation for history tracking
          const existingOperation = await this.creditOperationRepository.get(operation.id);
          
          // Create history for changes
          const history: CreditOperationHistory[] = [];
          const timestamp = new Date().toISOString();
          
          // Track changes
          if (operation.status && operation.status !== existingOperation.status) {
            history.push({
              field: 'status',
              oldValue: existingOperation.status,
              newValue: operation.status,
              changedAt: timestamp,
              changedBy: operation.actor_id ?? 'system',
            });
          }
          
          if (operation.quantity && operation.quantity !== existingOperation.quantity) {
            history.push({
              field: 'quantity',
              oldValue: existingOperation.quantity,
              newValue: operation.quantity,
              changedAt: timestamp,
              changedBy: operation.actor_id ?? 'system',
            });
          }

          if (operation.description && operation.description !== existingOperation.description) {
            history.push({
              field: 'description',
              oldValue: existingOperation.description,
              newValue: operation.description,
              changedAt: timestamp,
              changedBy: operation.actor_id ?? 'system',
            });
          }

          // Add history to existing metadata or create new metadata
          const existingMetadata = (existingOperation.metadata as Record<string, unknown>) ?? {};
          const existingHistory = (existingMetadata.history as CreditOperationHistory[]) ?? [];
          
          const updatedMetadata = {
            ...existingMetadata,
            history: [...existingHistory, ...history],
          };

          // Update operation with new metadata
          await this.creditOperationRepository.update({
            ...operation,
            metadata: JSON.parse(JSON.stringify(updatedMetadata)),
          });
        } else {
          // Create new operation - ensure required fields are provided
          if (!operation.actor_id) {
            throw new Error('Actor ID is required for new credit operations');
          }
          if (!operation.quantity) {
            throw new Error('Quantity is required for new credit operations');
          }
          
          await this.creditOperationRepository.create({
            actor_id: operation.actor_id,
            credit_id: payload.id,
            quantity: operation.quantity,
            status: operation.status ?? 'consumed',
            type: operation.type ?? 'user',
            description: operation.description ?? null,
            metadata: operation.metadata ?? null,
          });
        }
      }
    }

    return currentCredit;
  }

  async deleteOperation(creditId: string, actorId: string, creditOperationId?: string): Promise<void> {
    if (!this.creditOperationRepository) {
      throw new Error('Credit operation repository is required for operation methods');
    }

    // Create a 'consumed' operation to represent the deletion
    const deleteOperation: CreditOperations.Insert = {
      credit_id: creditId,
      actor_id: actorId,
      status: 'consumed',
      type: 'system',
      quantity: 0, // No quantity change, just marking as consumed
      description: 'Credit operation deleted',
      metadata: creditOperationId ? {
        history: [{
          field: 'deleted',
          oldValue: 'active',
          newValue: 'deleted',
          changedAt: new Date().toISOString(),
          changedBy: actorId,
        }],
        originalOperationId: creditOperationId,
      } : null,
    };

    await this.creditOperationRepository.create(deleteOperation);
  }

  // * UPDATE SERVICES
  async update(payload: Credit.Request.Update): Promise<Credit.Type> {
    // Handle credit operations if provided
    if (payload.credit_operations && this.creditOperationRepository) {
      // Process credit operations through the repository
      for (const operation of payload.credit_operations) {
        if (operation.id) {
          // Update existing operation
          await this.creditOperationRepository.update(operation);
        } else {
          // Create new operation
          await this.creditOperationRepository.create({
            actor_id: operation.actor_id!,
            credit_id: payload.id!,
            quantity: operation.quantity!,
            status: operation.status ?? 'consumed',
            type: operation.type ?? 'user',
            description: operation.description ?? null,
            metadata: operation.metadata ?? null,
          });
        }
      }
    }

    // Remove credit_operations from payload before updating credit
    const { credit_operations: _credit_operations, ...creditPayload } = payload;
    
    return await this.creditRepository.update(creditPayload);
  }

  // * DELETE SERVICES
  async delete(creditId: string): Promise<void> {
    // Soft delete the credit
    return await this.creditRepository.delete(creditId);
  }
}
