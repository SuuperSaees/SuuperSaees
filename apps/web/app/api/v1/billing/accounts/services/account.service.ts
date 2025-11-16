import { SupabaseClient } from '@supabase/supabase-js';



import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';



import { ApiError } from '~/lib/api/api-error';
import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Database } from '~/lib/database.types';



import { CreateAccountDTO, UpdateAccountDTO } from '../dtos/account.dto';
import { BillingAccountRepository } from '../repositories/account.repository';
import { IAccountRepository } from '../repositories/account.repository';


export class AccountService {
  constructor(
    // private readonly client: SupabaseClient<Database>,
    private readonly logger: LoggerInstance,
    private readonly accountRepository: IAccountRepository,
  ) {}

  async createAccount(data: CreateAccountDTO) {
    try {
      this.logger.info({ username: data.username }, 'Creating account');

      if (data.provider !== BillingAccounts.BillingProviderKeys.TRELI) {
        throw ApiError.badRequest('Only Treli provider is supported');
      }
      
      const account = await this.accountRepository.create(data);
      this.logger.info(
        { username: data.username },
        'Account created successfully',
      );
      return account;
    } catch (error) {
      this.logger.error({ error, data }, 'Failed to create account');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }

  async listByAccountId(accountId: string) {
    try {
      const accounts = await this.accountRepository.listByAccountId(accountId);
      this.logger.info({ accountId }, 'Account found successfully');
      return accounts;
    } catch (error) {
      this.logger.error({ error, accountId }, 'Failed to list accounts');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }

  async findById(id: string) {
    try {
      const account = await this.accountRepository.findById(id);
      this.logger.info({ id }, 'Account found successfully');
      return account;
    } catch (error) {
      this.logger.error({ error, id }, 'Failed to find account');
      throw error instanceof ApiError ? error : ApiError.internalError();
    }
  }

  async deleteAccount(id: string) {
    await this.accountRepository.softDelete(id);
  }

  async updateAccount(id: string, data: UpdateAccountDTO) {
    return this.accountRepository.update(id, data);
  }
}

export const createAccountService = async (
  client: SupabaseClient<Database>,
) => {
  const logger = await createLogger();
  const accountRepository = new BillingAccountRepository(client);
  return new AccountService(logger, accountRepository);
};