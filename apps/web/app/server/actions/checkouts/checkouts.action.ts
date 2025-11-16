'use server';

import { createCheckoutAction } from './checkouts';
import { Checkout } from '~/lib/checkout.types';

function getCheckoutAction() {
  return createCheckoutAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createCheckout(payload: Checkout.Request.Create) {
  return await getCheckoutAction().create(payload);
}

export async function getCheckout(checkoutId: string) {
  return await getCheckoutAction().get(checkoutId);
}

export async function updateCheckout(payload: Checkout.Request.Update) {
  return await getCheckoutAction().update(payload);
}