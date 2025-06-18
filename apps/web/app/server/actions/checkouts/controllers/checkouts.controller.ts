import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { CheckoutRepository } from '../repositories/checkouts.repository';
import { CheckoutServiceRepository } from '../repositories/checkout-services.repository';
import { CheckoutService, CreateCheckoutWithServicePayload, CheckoutWithServices } from '../services/checkouts.service';
import { CheckoutInsert, CheckoutType } from '../repositories/checkouts.repository';

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
  async create(payload: CheckoutInsert): Promise<CheckoutType> {
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

  async createWithService(payload: CreateCheckoutWithServicePayload): Promise<CheckoutWithServices> {
    try {
      const checkoutRepository = new CheckoutRepository(this.client, this.adminClient);
      const checkoutServiceRepository = new CheckoutServiceRepository(this.client, this.adminClient);
      const checkoutService = new CheckoutService(checkoutRepository, checkoutServiceRepository);
      return await checkoutService.createWithService(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async get(checkoutId: string): Promise<CheckoutType> {
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

  async getByProviderId(providerId: string): Promise<CheckoutType> {
    try {
      const checkoutRepository = new CheckoutRepository(this.client, this.adminClient);
      const checkoutServiceRepository = new CheckoutServiceRepository(this.client, this.adminClient);
      const checkoutService = new CheckoutService(checkoutRepository, checkoutServiceRepository);
      return await checkoutService.getByProviderId(providerId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getWithServices(checkoutId: string): Promise<CheckoutWithServices> {
    try {
      const checkoutRepository = new CheckoutRepository(this.client, this.adminClient);
      const checkoutServiceRepository = new CheckoutServiceRepository(this.client, this.adminClient);
      const checkoutService = new CheckoutService(checkoutRepository, checkoutServiceRepository);
      return await checkoutService.getWithServices(checkoutId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(checkoutId: string, updates: Partial<CheckoutInsert>): Promise<CheckoutType> {
    try {
      const checkoutRepository = new CheckoutRepository(this.client, this.adminClient);
      const checkoutServiceRepository = new CheckoutServiceRepository(this.client, this.adminClient);
      const checkoutService = new CheckoutService(checkoutRepository, checkoutServiceRepository);
      return await checkoutService.update(checkoutId, updates);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}