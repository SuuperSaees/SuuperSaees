'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getStripeAccountID } from '../../members/get/get-member-account';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const updateService = async (
  clientData: any,
  priceId: string,
  status?: string,
) => {
  try {
    console.log('clientData', clientData);
    console.log('priceId', priceId);
    const client = getSupabaseServerComponentClient();
    const stripe_account_id = await getStripeAccountID();
    if (!stripe_account_id) throw new Error('No stripe account found');
    const serviceUpdated = {
      status,
      name: clientData.step_service_details?.service_name,
      price: clientData.step_service_price?.price,
    };
    // const priceId = clientData?.clientData.step_service_price?.price_id as string;

    // Update service in Supabase, services row.
    const { error } = await client
      .from('services')
      .update(serviceUpdated)
      .eq('price_id', priceId);

    if (error) {
      throw new Error(error.message);
    }

    // Get Price in Stripe to get productId.
    const getPriceResponse = await fetch(
      `${baseUrl}/api/stripe/get-price?accountId=${encodeURIComponent(stripe_account_id)}&priceId=${encodeURIComponent(priceId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const getPriceData = await getPriceResponse.json();

    if (!getPriceResponse.ok) {
      throw new Error(`Stripe error: ${getPriceData.error}`);
    }

    // Update Service in Stripe.
    const stripeResponse = await fetch(
      `${baseUrl}/api/stripe/update-service?productId=${encodeURIComponent(getPriceData?.price?.product)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: stripe_account_id,
          name: clientData.step_service_details?.service_name,
          imageUrl: clientData.step_service_details?.service_image,
        }),
      },
    );

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      throw new Error(`Stripe error: ${stripeData.error}`);
    }
    // Create Price in Stripe

    const unitPrice = !clientData.step_service_price?.price
      ? 0
      : clientData.step_service_price?.price;
    const unitAmount = unitPrice * 100;
    const currency = 'usd';
    const isRecurring = !!getPriceData?.recurring;
    const interval = getPriceData?.recurring?.interval || null;

    const stripePriceResponse = await fetch(
      `${baseUrl}/api/stripe/create-service-price`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: stripe_account_id,
          productId: getPriceData?.price?.product,
          unitAmount: unitAmount,
          currency: currency,
          isRecurring,
          interval,
        }),
      },
    );

    const stripePriceData = await stripePriceResponse.json();

    if (!stripePriceResponse.ok) {
      throw new Error(`Stripe error: ${stripePriceData.error.message}`);
    }
    const { error: errorResponseUpdateService } = await client
      .from('services')
      .update({ price_id: stripePriceData?.priceId })
      .eq('price_id', priceId);

    if (errorResponseUpdateService) {
      throw new Error(errorResponseUpdateService.message);
    }
    revalidatePath('/services');
  } catch (error) {
    console.error('Error al actualizar el servicio:', error);
  }
};
