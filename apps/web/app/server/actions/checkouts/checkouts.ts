import { BaseAction } from '../base-action';
import { CheckoutController } from './controllers/checkouts.controller';
import { ICheckoutAction } from './checkouts.interface';
import { Checkout } from '~/lib/checkout.types';

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

  async create(payload: Checkout.Request.Create): Promise<Checkout.Response> {
    return await this.controller.create(payload);
  }

  async get(checkoutId: string): Promise<Checkout.Response> {
    return await this.controller.get(checkoutId);
  }

  async update(payload: Checkout.Request.Update): Promise<Checkout.Response> {
    return await this.controller.update(payload);
  }
}

export function createCheckoutAction(baseUrl: string) {
  return new CheckoutAction(baseUrl);
}