import { SupabaseClient } from '@supabase/supabase-js';

import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Database } from '~/lib/database.types';

import { BillingAccountBuilder } from '../builders/account.builder';
import { CreateAccountDTO, UpdateAccountDTO } from '../dtos/account.dto';

export interface IAccountRepository {
  create(data: CreateAccountDTO): Promise<BillingAccounts.Type>;
  findById(id: string): Promise<BillingAccounts.Type>;
  //   findByAccountId(accountId: string): Promise<BillingAccounts.Type>;
  listByAccountId(accountId: string): Promise<BillingAccounts.Type[]>;
  softDelete(id: string): Promise<void>;
  update(id: string, data: UpdateAccountDTO): Promise<BillingAccounts.Type>;
}

export class BillingAccountRepository implements IAccountRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async findById(id: string): Promise<BillingAccounts.Type> {
    const { data, error } = await this.client
      .from('billing_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(
        `Error fetching billing account with id ${id}: ${error.message}`,
      );
    }

    return data as BillingAccounts.Type;
  }

  async listByAccountId(accountId: string): Promise<BillingAccounts.Type[]> {
    const { data, error } = await this.client
      .from('billing_accounts')
      .select('*')
      .eq('account_id', accountId);

    if (error) {
      throw new Error(
        `Error fetching billing account with accountId ${accountId}: ${error.message}`,
      );
    }

    return data as BillingAccounts.Type[];
  }

  async create(data: CreateAccountDTO): Promise<BillingAccounts.Type> {
    const accountToInsert = BillingAccountBuilder.fromDTO(data);
    const { data: createdData, error } = await this.client
      .from('billing_accounts')
      .insert(accountToInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating billing account: ${error.message}`);
    }

    return createdData as BillingAccounts.Type;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from('billing_accounts')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting billing account: ${error.message}`);
    }
  }

  async update(
    id: string,
    data: UpdateAccountDTO,
  ): Promise<BillingAccounts.Type> {
    const accountToUpdate = BillingAccountBuilder.fromDTO(data);
    const { data: updatedData, error } = await this.client
      .from('billing_accounts')
      .update(accountToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating billing account: ${error.message}`);
    }

    return updatedData as BillingAccounts.Type;
  }
}
