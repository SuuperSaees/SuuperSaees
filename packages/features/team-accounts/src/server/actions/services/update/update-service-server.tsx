'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getStripeAccountID } from '../../members/get/get-member-account';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
  step_connect_briefs: any;
}


export const updateService = async (
  clientData: ServiceData,
  priceId: string,
  status?: string,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const stripe_account_id = await getStripeAccountID();
    if (!stripe_account_id) throw new Error('No stripe account found');
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
    const { data: updatedService, error: updateError } = await client
      .from('services')
      .update(serviceUpdated)
      .eq('price_id', priceId)
      .select('id');

    if (updateError) {
      throw new Error(updateError.message);
    }

    const serviceId = updatedService?.[0]?.id ?? priceId;

    const { data: existingBriefs, error: getBriefsError } = await client
      .from('service_briefs')
      .select('brief_id')
      .eq('service_id', serviceId);

    if (getBriefsError) {
      throw new Error(getBriefsError.message);
    }

    // Get the briefs sent to the client
    const newBriefs = clientData.step_connect_briefs;

    // Filter briefs that are not yet connected to the service
    const briefsToAdd = newBriefs.filter((brief) => {
      return !existingBriefs.some((existing) => existing.brief_id === brief.id);
    });

    if (briefsToAdd.length > 0) {
      // Insert the new briefs into the service_briefs table
      const { error: insertError } = await client
        .from('service_briefs')
        .insert(
          briefsToAdd.map((brief) => ({
            service_id: updatedService?.[0]?.id ?? '',
            brief_id: brief.id,
          }))
        );

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    // Filter out briefs that are no longer connected to the service and delete them
    const briefsToRemove = existingBriefs.filter((existing) => {
      return !newBriefs.some((brief) => brief.id === existing.brief_id);
    });

    if (briefsToRemove.length > 0) {
      const { error: deleteError } = await client
        .from('service_briefs')
        .delete()
        .in(
          'brief_id',
          briefsToRemove.map((brief) => brief.brief_id)
        )
        .eq('service_id', serviceId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
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
