import { Credit, CreditOperations } from '~/lib/credit.types';
import { CreditRepository } from '../repositories/credits.repository';
import { CreditOperationRepository } from '../repositories/credit-operations.repository';
import { CreditOperationHistory, CreditRemoveHistory, validateCreditOperation, validateCredit, isCreditRequestCreate, isCreditRequestUpdate, isCreditRequestRemove } from '../type-guards';

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

    // Validate the payload structure
    if (!isCreditRequestCreate(payload)) {
      throw new Error('Invalid payload structure for credit operation creation');
    }

    // Validate credit operations are provided
    if (!payload.credit_operations || payload.credit_operations.length === 0) {
      throw new Error('No credit operations provided for createOperation');
    }

    // Validate each credit operation
    for (const operation of payload.credit_operations) {
      const validation = validateCreditOperation(operation);
      if (!validation.isValid) {
        throw new Error(`Invalid credit operation: ${validation.errors.join(', ')}`);
      }
    }

    let creditId: string;

    // Priority order: payload.id > credit_id in operations > client_organization_id lookup
    if (payload.id) {
      // Credit ID provided in payload - verify it exists and use it
      try {
        await this.creditRepository.getById(payload.id);
        creditId = payload.id;
      } catch (error) {
        throw new Error(`Provided credit ID ${payload.id} does not exist`);
      }
    } else {
      // Check if credit_id is provided in any of the operations
      const providedCreditId = payload.credit_operations.find(op => op.credit_id)?.credit_id;
      
      if (providedCreditId) {
        // Credit ID provided in operations - verify it exists and use it
        try {
          await this.creditRepository.getById(providedCreditId);
          creditId = providedCreditId;
        } catch (error) {
          throw new Error(`Provided credit ID ${providedCreditId} does not exist`);
        }
      } else if (payload.client_organization_id) {
        // No credit ID provided - try to find existing credit by client organization
        try {
          const existingCredit = await this.creditRepository.get(payload.client_organization_id);
          creditId = existingCredit.id;
        } catch (error) {
          // Credit not found - create as strict fallback only if all required data is present
          if (!payload.agency_id) {
            throw new Error('Agency ID is required to create new credit as fallback');
          }
          
          // Validate credit data before creating fallback
          const creditValidation = validateCredit(payload);
          if (!creditValidation.isValid) {
            throw new Error(`Cannot create fallback credit: ${creditValidation.errors.join(', ')}`);
          }
          
          // Create credit as strict fallback
          const newCredit = await this.creditRepository.create({
            agency_id: payload.agency_id,
            client_organization_id: payload.client_organization_id,
            balance: payload.balance ?? 0,
            user_id: payload.user_id ?? null,
          });
          creditId = newCredit.id;
        }
      } else {
        throw new Error('Either credit_id (payload.id or operation.credit_id) or client_organization_id is required for credit operations');
      }
    }

    // Create the operations with default status 'purchased'
    for (const operation of payload.credit_operations) {
      await this.creditOperationRepository.create({
        ...operation,
        credit_id: operation.credit_id ?? creditId, // Use provided credit_id or resolved creditId
        status: operation.status ?? 'purchased', // Default to 'purchased' for new operations
        type: operation.type ?? 'user',
      });
    }

    // Return the credit (existing or newly created)
    return await this.creditRepository.getById(creditId);
  }

  async updateOperation(payload: Credit.Request.Update): Promise<Credit.Type> {
    if (!this.creditOperationRepository) {
      throw new Error('Credit operation repository is required for operation methods');
    }

    // Validate the payload structure
    if (!isCreditRequestUpdate(payload)) {
      throw new Error('Invalid payload structure for credit operation update');
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
            status: operation.status ?? 'purchased',
            type: operation.type ?? 'user',
            description: operation.description ?? null,
            metadata: operation.metadata ?? null,
          });
        }
      }
    }

    return currentCredit;
  }

  async removeOperation(payload: Credit.Request.Remove): Promise<Credit.Type> {
    if (!this.creditOperationRepository) {
      throw new Error('Credit operation repository is required for operation methods');
    }

    // Validate the payload structure
    if (!isCreditRequestRemove(payload)) {
      throw new Error('Invalid payload structure for credit operation removal');
    }

    // Validate credit operations are provided
    if (!payload.credit_operations || payload.credit_operations.length === 0) {
      throw new Error('No credit operations provided for removeOperation');
    }

    // Validate each credit operation
    for (const operation of payload.credit_operations) {
      const validation = validateCreditOperation(operation);
      if (!validation.isValid) {
        throw new Error(`Invalid credit operation: ${validation.errors.join(', ')}`);
      }
    }

    let creditId: string;
    let currentCredit: Credit.Type;

    // Priority order: payload.id > credit_id in operations > client_organization_id lookup
    if (payload.id) {
      // Credit ID provided in payload - verify it exists and use it
      try {
        currentCredit = await this.creditRepository.getById(payload.id);
        creditId = payload.id;
      } catch (error) {
        throw new Error(`Provided credit ID ${payload.id} does not exist`);
      }
    } else {
      // Check if credit_id is provided in any of the operations
      const providedCreditId = payload.credit_operations.find(op => op.credit_id)?.credit_id;
      
      if (providedCreditId) {
        // Credit ID provided in operations - verify it exists and use it
        try {
          currentCredit = await this.creditRepository.getById(providedCreditId);
          creditId = providedCreditId;
        } catch (error) {
          throw new Error(`Provided credit ID ${providedCreditId} does not exist`);
        }
      } else if (payload.client_organization_id) {
        // No credit ID provided - try to find existing credit by client organization
        try {
          currentCredit = await this.creditRepository.get(payload.client_organization_id);
          creditId = currentCredit.id;
        } catch (error) {
          throw new Error(`Credit not found for client organization ${payload.client_organization_id}. Cannot remove operations from non-existent credit.`);
        }
      } else {
        throw new Error('Either credit_id (payload.id or operation.credit_id) or client_organization_id is required for credit operations removal');
      }
    }

    // Create remove history for metadata
    const timestamp = new Date().toISOString();
    const oldQuantity = currentCredit.balance;

    // Create the operations with default status 'consumed'
    for (const operation of payload.credit_operations) {
      const removeHistory: CreditRemoveHistory = {
        oldQuantity: oldQuantity,
        newQuantity: oldQuantity - operation.quantity, // Calculate new balance after operation
        changedAt: timestamp,
        changedBy: operation.actor_id,
        description: operation.description ?? 'Credit operation removed',
        type: operation.type === 'system' ? 'system' : 'user',
        status: operation.status as 'consumed' | 'purchased' | 'refunded' | 'locked' | 'expired' ?? 'consumed',
        operationType: 'remove',
      };

      await this.creditOperationRepository.create({
        ...operation,
        credit_id: operation.credit_id ?? creditId, // Use provided credit_id or resolved creditId
        status: operation.status ?? 'consumed', // Default to 'consumed' for remove operations
        type: operation.type ?? 'user',
        metadata: JSON.parse(JSON.stringify({
          history: [removeHistory],
        })),
      });
    }

    // Return the updated credit
    return await this.creditRepository.getById(creditId);
  }
}
