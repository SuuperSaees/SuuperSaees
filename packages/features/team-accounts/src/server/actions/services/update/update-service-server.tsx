'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getStripeAccountID } from '../../members/get/get-member-account';
import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';

// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

interface ServiceData {
  step_type_of_service: {
    single_sale: boolean;
    recurring_subscription: boolean;
  };
  step_service_details: {
    service_image: string;
    service_name: string;
    service_description: string;
  };
  step_service_price: {
    standard: boolean;
    purchase_limit: number;
    allowed_orders: number;
    time_based: boolean;
    hours: number;
    credit_based: boolean;
    credits: number;
    price: number;
    recurrence: string;
    test_period: boolean;
    test_period_duration: number;
    test_period_duration_unit_of_measurement: string;
    test_period_price: number;
    max_number_of_simultaneous_orders: number;
    max_number_of_monthly_orders: number;
  };
}


export const updateService = async (
  clientData: ServiceData,
  priceId: string,
  status?: string,
) => {
  try {
    console.log('clientData', clientData);
    console.log('priceId', priceId);
    const client = getSupabaseServerComponentClient();
    const { userId, stripeId } = await getStripeAccountID();
    if (!stripeId) throw new Error('No stripe account found');
    if (!userId) throw new Error('No user found');
    const serviceUpdated = {
      status,
      name: clientData.step_service_details?.service_name,
      price: clientData.step_service_price?.price,
      service_image: clientData.step_service_details?.service_image,
      service_description: clientData.step_service_details?.service_description,
      purchase_limit: clientData.step_service_price?.purchase_limit,
      allowed_orders: clientData.step_service_price?.allowed_orders,
      time_based: clientData.step_service_price?.time_based,
      hours: clientData.step_service_price?.hours,
      credit_based: clientData.step_service_price?.credit_based,
      credits: clientData.step_service_price?.credits,
      recurrence: clientData.step_service_price?.recurrence,
      test_period: clientData.step_service_price?.test_period,
      test_period_duration_unit_of_measurement:
        clientData.step_service_price?.test_period_duration_unit_of_measurement,
      test_period_price: clientData.step_service_price?.test_period_price,
      max_number_of_simultaneous_orders:
        clientData.step_service_price?.max_number_of_simultaneous_orders,
      max_number_of_monthly_orders:
        clientData.step_service_price?.max_number_of_monthly_orders,
      single_sale: clientData.step_type_of_service?.single_sale,
      recurring_subscription:
        clientData.step_type_of_service?.recurring_subscription,
    };

    // Update service in Supabase, services row.
    const { error } = await client
      .from('services')
      .update(serviceUpdated)
      .eq('price_id', priceId);

    if (error) {
      throw new Error(error.message);
    }

    // Get Price in Stripe to get productId.
    const baseUrl = await getDomainByUserId(userId, true);
    const getPriceResponse = await fetch(
      `${baseUrl}/api/stripe/get-price?accountId=${encodeURIComponent(stripeId)}&priceId=${encodeURIComponent(priceId)}`,
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
          accountId: stripeId,
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
    const isRecurring = clientData.step_type_of_service?.recurring_subscription;
    const interval = clientData.step_service_price?.recurrence;

    const stripePriceResponse = await fetch(
      `${baseUrl}/api/stripe/create-service-price`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: stripeId,
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