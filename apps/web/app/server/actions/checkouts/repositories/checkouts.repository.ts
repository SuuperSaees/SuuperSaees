import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Checkout } from '~/lib/checkout.types';

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
  async create(payload: Checkout.Request.Create): Promise<Checkout.Response> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('checkouts')
      .insert({
        provider: payload.provider,
        provider_id: payload.provider_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating checkout: ${error.message}`);
    }

    return data as Checkout.Response;
  }

  // * GET REPOSITORIES
  async get(checkoutId: string): Promise<Checkout.Response> {
    const client = this.client;
    const { data, error } = await client
      .from('checkouts')
      .select('*')
      .eq('id', checkoutId)
      .single();

    if (error) {
      throw new Error(`Error fetching checkout ${checkoutId}: ${error.message}`);
    }

    return data as Checkout.Response;
  }

  async getByProviderId(providerId: string): Promise<Checkout.Response> {
    const client = this.client;
    const { data, error } = await client
      .from('checkouts')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    if (error) {
      throw new Error(`Error fetching checkout by provider ID ${providerId}: ${error.message}`);
    }

    return data as Checkout.Response;
  }

  // * UPDATE REPOSITORIES
  async update(payload: Checkout.Request.Update): Promise<Checkout.Response> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('checkouts')
      .update(payload)
      .eq('id', payload.id ?? '')
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating checkout ${payload.id}: ${error.message}`);
    }

    return data as Checkout.Response;
  }
}