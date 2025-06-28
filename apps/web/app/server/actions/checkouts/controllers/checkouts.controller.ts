import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { CheckoutRepository } from '../repositories/checkouts.repository';
import { CheckoutServiceRepository } from '../../checkout-services/repositories/checkout-services.repository';
import { Checkout } from '~/lib/checkout.types';
import { CheckoutService } from '../services/checkouts.service';

export class CheckoutController {
  private baseUrl: string;
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE CONTROLLERS
  async create(payload: Checkout.Request.Create): Promise<Checkout.Response> {
    try {
      const checkoutRepository = new CheckoutRepository(this.client, this.adminClient);
      const checkoutServiceRepository = new CheckoutServiceRepository(this.client, this.adminClient);
      const checkoutService = new CheckoutService(checkoutRepository, checkoutServiceRepository);
      return await checkoutService.create(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async get(checkoutId: string): Promise<Checkout.Response> {
    try {
      const checkoutRepository = new CheckoutRepository(this.client, this.adminClient);
      const checkoutServiceRepository = new CheckoutServiceRepository(this.client, this.adminClient);
      const checkoutService = new CheckoutService(checkoutRepository, checkoutServiceRepository);
      return await checkoutService.get(checkoutId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(payload: Checkout.Request.Update): Promise<Checkout.Response> {
    try {
      const checkoutRepository = new CheckoutRepository(this.client, this.adminClient);
      const checkoutServiceRepository = new CheckoutServiceRepository(this.client, this.adminClient);
      const checkoutService = new CheckoutService(checkoutRepository, checkoutServiceRepository);
      return await checkoutService.update(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}