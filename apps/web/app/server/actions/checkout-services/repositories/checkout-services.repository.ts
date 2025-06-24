import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { CheckoutService } from '~/lib/checkout.types';

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
  async create(payload: CheckoutService.Request.Create): Promise<CheckoutService.Response> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('checkout_services')
      .insert({
        checkout_id: payload.checkout_id,
        service_id: payload.service_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating checkout service: ${error.message}`);
    }

    return data as CheckoutService.Response;
  }
}