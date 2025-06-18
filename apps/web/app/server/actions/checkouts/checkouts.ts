import { BaseAction } from '../base-action';
import { CheckoutController } from './controllers/checkouts.controller';
import { ICheckoutAction } from './checkouts.interface';
import { CheckoutInsert, CheckoutType } from './repositories/checkouts.repository';
import { CreateCheckoutWithServicePayload, CheckoutWithServices } from './services/checkouts.service';

export class CheckoutAction extends BaseAction implements ICheckoutAction {
  private controller: CheckoutController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new CheckoutController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async create(payload: CheckoutInsert): Promise<CheckoutType> {
    return await this.controller.create(payload);
  }

  async createWithService(payload: CreateCheckoutWithServicePayload): Promise<CheckoutWithServices> {
    return await this.controller.createWithService(payload);
  }

  async get(checkoutId: string): Promise<CheckoutType> {
    return await this.controller.get(checkoutId);
  }

  async getByProviderId(providerId: string): Promise<CheckoutType> {
    return await this.controller.getByProviderId(providerId);
  }

  async getWithServices(checkoutId: string): Promise<CheckoutWithServices> {
    return await this.controller.getWithServices(checkoutId);
  }

  async update(checkoutId: string, updates: Partial<CheckoutInsert>): Promise<CheckoutType> {
    return await this.controller.update(checkoutId, updates);
  }
}

export function createCheckoutAction(baseUrl: string) {
  return new CheckoutAction(baseUrl);
}