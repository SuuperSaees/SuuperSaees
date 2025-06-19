import { CheckoutRepository } from '../repositories/checkouts.repository';
import { CheckoutServiceRepository } from '../../checkout-services/repositories/checkout-services.repository';
import { Checkout } from '~/lib/checkout.types';

export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly checkoutServiceRepository: CheckoutServiceRepository
  ) {}

  // * CREATE SERVICES
  async create(payload: Checkout.Request.Create): Promise<Checkout.Response> {
    return await this.checkoutRepository.create(payload);
  }

  // * GET SERVICES
  async get(checkoutId: string): Promise<Checkout.Response> {
    return await this.checkoutRepository.get(checkoutId);
  }

  // * UPDATE SERVICES
  async update(payload: Checkout.Request.Update): Promise<Checkout.Response> {
    return await this.checkoutRepository.update(payload);
  }
}