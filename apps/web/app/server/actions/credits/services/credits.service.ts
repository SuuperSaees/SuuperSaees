import { Credit, CreditOperations } from '~/lib/credit.types';
import { CreditRepository } from '../repositories/credits.repository';
import { CreditOperationRepository } from '../repositories/credit-operations.repository';

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
    data: Credit.Response[];
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

  async get(creditId: string): Promise<Credit.Response> {
    return await this.creditRepository.get(creditId);
  }

  async getByClientOrganization(clientOrganizationId: string): Promise<Credit.Response[]> {
    return await this.creditRepository.getByClientOrganization(clientOrganizationId);
  }

  async getByAgency(agencyId: string): Promise<Credit.Response[]> {
    return await this.creditRepository.getByAgency(agencyId);
  }

  async getBalance(creditId: string): Promise<number> {
    return await this.creditRepository.getBalance(creditId);
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
            ...operation,
            credit_id: payload.id!,
          });
        }
      }
    }

    // Remove credit_operations from payload before updating credit
    const { credit_operations, ...creditPayload } = payload;
    
    return await this.creditRepository.update(creditPayload);
  }

  // * DELETE SERVICES
  async delete(creditId: string): Promise<void> {
    // Soft delete the credit
    return await this.creditRepository.delete(creditId);
  }

  // * BUSINESS LOGIC SERVICES
  async addCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    if (operationData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Create a purchase operation (adds credits)
    return await this.creditRepository.createCreditOperation(creditId, {
      status: CreditOperations.Enums.Status.PURCHASED,
      type: CreditOperations.Enums.Type.USER,
      quantity: operationData.quantity,
      description: operationData.description || 'Credit purchase',
      actorId: operationData.actorId,
      metadata: operationData.metadata,
    });
  }

  async consumeCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    if (operationData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Check if sufficient balance exists
    const currentBalance = await this.getBalance(creditId);
    if (currentBalance < operationData.quantity) {
      throw new Error(`Insufficient credits. Current balance: ${currentBalance}, Requested: ${operationData.quantity}`);
    }

    // Create a consumption operation (subtracts credits)
    return await this.creditRepository.createCreditOperation(creditId, {
      status: CreditOperations.Enums.Status.CONSUMED,
      type: CreditOperations.Enums.Type.USER,
      quantity: operationData.quantity,
      description: operationData.description || 'Credit consumption',
      actorId: operationData.actorId,
      metadata: operationData.metadata,
    });
  }

  async refundCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    if (operationData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Create a refund operation (adds credits back)
    return await this.creditRepository.createCreditOperation(creditId, {
      status: CreditOperations.Enums.Status.REFUNDED,
      type: CreditOperations.Enums.Type.SYSTEM,
      quantity: operationData.quantity,
      description: operationData.description || 'Credit refund',
      actorId: operationData.actorId,
      metadata: operationData.metadata,
    });
  }

  async lockCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type> {
    if (operationData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Check if sufficient balance exists
    const currentBalance = await this.getBalance(creditId);
    if (currentBalance < operationData.quantity) {
      throw new Error(`Insufficient credits to lock. Current balance: ${currentBalance}, Requested: ${operationData.quantity}`);
    }

    // Create a lock operation (temporarily reserves credits)
    return await this.creditRepository.createCreditOperation(creditId, {
      status: CreditOperations.Enums.Status.LOCKED,
      type: CreditOperations.Enums.Type.SYSTEM,
      quantity: operationData.quantity,
      description: operationData.description || 'Credit lock',
      actorId: operationData.actorId,
      metadata: operationData.metadata,
    });
  }

  async transferCredits(transferData: {
    fromCreditId: string;
    toCreditId: string;
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }): Promise<CreditOperations.Type[]> {
    if (transferData.quantity <= 0) {
      throw new Error('Transfer quantity must be greater than 0');
    }

    // Check if sufficient balance exists in source
    const sourceBalance = await this.getBalance(transferData.fromCreditId);
    if (sourceBalance < transferData.quantity) {
      throw new Error(`Insufficient credits for transfer. Source balance: ${sourceBalance}, Transfer amount: ${transferData.quantity}`);
    }

    // Verify both credit records exist
    await this.get(transferData.fromCreditId);
    await this.get(transferData.toCreditId);

    const transferDescription = transferData.description || `Credit transfer of ${transferData.quantity} credits`;

    // Create operations for both sides of the transfer
    const operations: CreditOperations.Type[] = [];

    // Debit from source
    const debitOperation = await this.creditRepository.createCreditOperation(transferData.fromCreditId, {
      status: CreditOperations.Enums.Status.CONSUMED,
      type: CreditOperations.Enums.Type.SYSTEM,
      quantity: transferData.quantity,
      description: `${transferDescription} (outgoing)`,
      actorId: transferData.actorId,
      metadata: {
        ...transferData.metadata,
        transferType: 'outgoing',
        targetCreditId: transferData.toCreditId,
      },
    });
    operations.push(debitOperation);

    // Credit to destination
    const creditOperation = await this.creditRepository.createCreditOperation(transferData.toCreditId, {
      status: CreditOperations.Enums.Status.PURCHASED,
      type: CreditOperations.Enums.Type.SYSTEM,
      quantity: transferData.quantity,
      description: `${transferDescription} (incoming)`,
      actorId: transferData.actorId,
      metadata: {
        ...transferData.metadata,
        transferType: 'incoming',
        sourceCreditId: transferData.fromCreditId,
      },
    });
    operations.push(creditOperation);

    return operations;
  }

  // * UTILITY SERVICES
  async getCreditHistory(
    creditId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CreditOperations.Response[]> {
    if (!this.creditOperationRepository) {
      throw new Error('Credit operation repository not available');
    }

    if (startDate && endDate) {
      return await this.creditOperationRepository.getOperationsByDateRange(creditId, startDate, endDate);
    }

    return await this.creditOperationRepository.getByCreditId(creditId);
  }

  async getCreditSummary(creditId: string): Promise<{
    currentBalance: number;
    totalPurchased: number;
    totalConsumed: number;
    totalRefunded: number;
    totalLocked: number;
    totalExpired: number;
  }> {
    if (!this.creditOperationRepository) {
      throw new Error('Credit operation repository not available');
    }

    const currentBalance = await this.getBalance(creditId);
    
    const [totalPurchased, totalConsumed, totalRefunded, totalLocked, totalExpired] = await Promise.all([
      this.creditOperationRepository.getTotalQuantityByStatus(creditId, CreditOperations.Enums.Status.PURCHASED),
      this.creditOperationRepository.getTotalQuantityByStatus(creditId, CreditOperations.Enums.Status.CONSUMED),
      this.creditOperationRepository.getTotalQuantityByStatus(creditId, CreditOperations.Enums.Status.REFUNDED),
      this.creditOperationRepository.getTotalQuantityByStatus(creditId, CreditOperations.Enums.Status.LOCKED),
      this.creditOperationRepository.getTotalQuantityByStatus(creditId, CreditOperations.Enums.Status.EXPIRED),
    ]);

    return {
      currentBalance,
      totalPurchased,
      totalConsumed,
      totalRefunded,
      totalLocked,
      totalExpired,
    };
  }
}
