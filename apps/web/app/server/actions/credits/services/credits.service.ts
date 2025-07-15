import { Credit } from '~/lib/credit.types';
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

}
