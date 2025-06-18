import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';

export interface CheckoutInsert {
  provider: string;
  provider_id: string;
  status?: string;
  created_at?: string;
}

export interface CheckoutType {
  id: string;
  provider: string;
  provider_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class CheckoutRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async create(payload: CheckoutInsert): Promise<CheckoutType> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('checkouts')
      .insert({
        provider: payload.provider,
        provider_id: payload.provider_id,
        status: payload.status ?? 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating checkout: ${error.message}`);
    }

    return data as CheckoutType;
  }

  // * GET REPOSITORIES
  async get(checkoutId: string): Promise<CheckoutType> {
    const client = this.client;
    const { data, error } = await client
      .from('checkouts')
      .select('*')
      .eq('id', checkoutId)
      .single();

    if (error) {
      throw new Error(`Error fetching checkout ${checkoutId}: ${error.message}`);
    }

    return data as CheckoutType;
  }

  async getByProviderId(providerId: string): Promise<CheckoutType> {
    const client = this.client;
    const { data, error } = await client
      .from('checkouts')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    if (error) {
      throw new Error(`Error fetching checkout by provider ID ${providerId}: ${error.message}`);
    }

    return data as CheckoutType;
  }

  // * UPDATE REPOSITORIES
  async update(checkoutId: string, updates: Partial<CheckoutInsert>): Promise<CheckoutType> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('checkouts')
      .update(updates)
      .eq('id', checkoutId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating checkout ${checkoutId}: ${error.message}`);
    }

    return data as CheckoutType;
  }
}