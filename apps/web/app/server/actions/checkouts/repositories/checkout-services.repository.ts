import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';

export interface CheckoutServiceInsert {
  checkout_id: string;
  service_id: number;
  quantity?: number;
}

export interface CheckoutServiceType {
  id: string;
  checkout_id: string;
  service_id: number;
  quantity: number;
  created_at: string;
}

export class CheckoutServiceRepository {
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
  async create(payload: CheckoutServiceInsert): Promise<CheckoutServiceType> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('checkout_services')
      .insert({
        checkout_id: payload.checkout_id,
        service_id: payload.service_id,
        quantity: payload.quantity ?? 1,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating checkout service: ${error.message}`);
    }

    return data as CheckoutServiceType;
  }

  // * GET REPOSITORIES
  async getByCheckoutId(checkoutId: string): Promise<CheckoutServiceType[]> {
    const client = this.client;
    const { data, error } = await client
      .from('checkout_services')
      .select('*')
      .eq('checkout_id', checkoutId);

    if (error) {
      throw new Error(`Error fetching checkout services for checkout ${checkoutId}: ${error.message}`);
    }

    return data as CheckoutServiceType[];
  }

  // * DELETE REPOSITORIES
  async deleteByCheckoutId(checkoutId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('checkout_services')
      .delete()
      .eq('checkout_id', checkoutId);

    if (error) {
      throw new Error(`Error deleting checkout services for checkout ${checkoutId}: ${error.message}`);
    }
  }
}