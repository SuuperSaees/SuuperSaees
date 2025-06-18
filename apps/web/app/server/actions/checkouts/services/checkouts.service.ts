import { CheckoutRepository, CheckoutInsert, CheckoutType } from '../repositories/checkouts.repository';
import { CheckoutServiceRepository, CheckoutServiceInsert, CheckoutServiceType } from '../repositories/checkout-services.repository';

export interface CreateCheckoutWithServicePayload {
  provider: string;
  provider_id: string;
  service_id: number;
  quantity?: number;
  status?: string;
}

export interface CheckoutWithServices extends CheckoutType {
  checkout_services: CheckoutServiceType[];
}

export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly checkoutServiceRepository: CheckoutServiceRepository
  ) {}

  // * CREATE SERVICES
  async create(payload: CheckoutInsert): Promise<CheckoutType> {
    return await this.checkoutRepository.create(payload);
  }

  async createWithService(payload: CreateCheckoutWithServicePayload): Promise<CheckoutWithServices> {
    // 1. Crear el checkout
    const checkout = await this.checkoutRepository.create({
      provider: payload.provider,
      provider_id: payload.provider_id,
      status: payload.status ?? 'pending',
    });

    // 2. Crear la relación con el servicio
    const checkoutService = await this.checkoutServiceRepository.create({
      checkout_id: checkout.id,
      service_id: payload.service_id,
      quantity: payload.quantity ?? 1,
    });

    return {
      ...checkout,
      checkout_services: [checkoutService],
    };
  }

  // * GET SERVICES
  async get(checkoutId: string): Promise<CheckoutType> {
    return await this.checkoutRepository.get(checkoutId);
  }

  async getByProviderId(providerId: string): Promise<CheckoutType> {
    return await this.checkoutRepository.getByProviderId(providerId);
  }

  async getWithServices(checkoutId: string): Promise<CheckoutWithServices> {
    const checkout = await this.checkoutRepository.get(checkoutId);
    const services = await this.checkoutServiceRepository.getByCheckoutId(checkoutId);

    return {
      ...checkout,
      checkout_services: services,
    };
  }

  // * UPDATE SERVICES
  async update(checkoutId: string, updates: Partial<CheckoutInsert>): Promise<CheckoutType> {
    return await this.checkoutRepository.update(checkoutId, updates);
  }

  // * DELETE SERVICES
  async delete(checkoutId: string): Promise<void> {
    // Primero eliminar los servicios relacionados
    await this.checkoutServiceRepository.deleteByCheckoutId(checkoutId);
    // Luego actualizar el estado del checkout (soft delete)
    await this.checkoutRepository.update(checkoutId, { status: 'deleted' });
  }
}