'use server';

import { createCheckoutAction } from './checkouts';
import { CheckoutInsert } from './repositories/checkouts.repository';
import { CreateCheckoutWithServicePayload } from './services/checkouts.service';

function getCheckoutAction() {
  return createCheckoutAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createCheckout(payload: CheckoutInsert) {
  return await getCheckoutAction().create(payload);
}

export async function createCheckoutWithService(payload: CreateCheckoutWithServicePayload) {
  return await getCheckoutAction().createWithService(payload);
}

export async function getCheckout(checkoutId: string) {
  return await getCheckoutAction().get(checkoutId);
}

export async function getCheckoutByProviderId(providerId: string) {
  return await getCheckoutAction().getByProviderId(providerId);
}

export async function getCheckoutWithServices(checkoutId: string) {
  return await getCheckoutAction().getWithServices(checkoutId);
}

export async function updateCheckout(checkoutId: string, updates: Partial<CheckoutInsert>) {
  return await getCheckoutAction().update(checkoutId, updates);
}