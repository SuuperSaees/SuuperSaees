'use server';

import { revalidatePath } from 'next/cache';

import { SupabaseClient } from '@supabase/supabase-js';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import {
  // CustomError,
  CustomResponse,
  // ErrorServiceOperations,
} from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';
// import { getStripeAccountID } from '../../members/get/get-member-account';

// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Main function
export const updateService = async (
  clientData: Service.ServiceData,
  priceId: string,
  status?: Service.Type['status'],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    // const { stripeId } = await getStripeAccountID();
    // if (!stripeId)
    //   throw new CustomError(
    //     400,
    //     'No stripe account found',
    //     ErrorServiceOperations.FAILED_TO_FIND_STRIPE_ACCOUNT,
    //   );
    // const { domain: baseUrl } = await getDomainByUserId(userId, true);

    // Update service details in Supabase
    await updateSupabaseService(
      client,
      clientData,
      priceId,
      status,
    );

    // Manage briefs in Supabase
    await manageServiceBriefs(
      client,
      clientData.id,
      clientData.step_connect_briefs,
    );

    // Update Stripe product and price
    // await handleStripeServiceUpdate(baseUrl, stripeId, priceId, clientData);

    // Revalidate services page
    revalidatePath('/services');
    return CustomResponse.success(null, 'serviceUpdated').toJSON();
  } catch (error) {
    console.error('Error updating service:', error);
    return CustomResponse.error(error).toJSON();
  }
};

// Function to update service in Supabase
const updateSupabaseService = async (
  client: SupabaseClient,
  clientData: Service.ServiceData,
  priceId: string,
  status?: Service.Type['status'],
): Promise<void> => {
  const serviceUpdated = {
    id: clientData.id,
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
    recurrence: clientData.step_type_of_service?.recurring_subscription
      ? clientData.step_service_price?.recurrence
      : null,
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

  const { error: updateError } = await client
    .from('services')
    .update(serviceUpdated)
    .eq('id', clientData.id)

  if (updateError) {
    throw new Error(updateError.message);
  }
  return;
};

// Function to manage briefs in Supabase
const manageServiceBriefs = async (
  client: SupabaseClient,
  serviceId: number,
  newBriefs: Service.ServiceData['step_connect_briefs'],
) => {
  const { data: existingBriefs, error: getBriefsError } = await client
    .from('service_briefs')
    .select('brief_id')
    .eq('service_id', serviceId);

  if (getBriefsError) {
    throw new Error(getBriefsError.message);
  }

  const briefsToAdd = newBriefs.filter(
    (brief) =>
      !existingBriefs.some((existing) => existing.brief_id === brief.id),
  );

  if (briefsToAdd.length > 0) {
    const { error: insertError } = await client.from('service_briefs').insert(
      briefsToAdd.map((brief) => ({
        service_id: serviceId,
        brief_id: brief.id,
      })),
    );
    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const briefsToRemove = existingBriefs.filter(
    (existing) => !newBriefs.some((brief) => brief.id === existing.brief_id),
  );

  if (briefsToRemove.length > 0) {
    const { error: deleteError } = await client
      .from('service_briefs')
      .delete()
      .in(
        'brief_id',
        briefsToRemove.map((brief: { brief_id: string }) => brief.brief_id),
      )
      .eq('service_id', serviceId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }
};

// interface PriceData {
//   price: {
//     id: string;
//     object: 'price';
//     active: boolean;
//     billing_scheme: string;
//     created: number;
//     currency: string;
//     custom_unit_amount: number | null;
//     livemode: boolean;
//     lookup_key: string | null;
//     metadata: Record<string, string>;
//     nickname: string | null;
//     product: string;
//     recurring: null | {
//       interval: string;
//       interval_count: number;
//     };
//     tax_behavior: string;
//     tiers_mode: string | null;
//     transform_quantity: null | {
//       divide_by: number;
//       round: 'up' | 'down';
//     };
//     type: string;
//     unit_amount: number;
//     unit_amount_decimal: string;
//     error?: string;
//   };
//   error?: string;
// }

// Function to handle Stripe service update and price creation
// const handleStripeServiceUpdate = async (
//   baseUrl: string,
//   stripeAccountID: string,
//   priceId: string,
//   clientData: Service.ServiceData,
// ) => {
//   const getPriceResponse = await fetch(
//     `${baseUrl}/api/stripe/get-price?accountId=${encodeURIComponent(stripeAccountID)}&priceId=${encodeURIComponent(priceId)}`,
//     { method: 'GET', headers: { 'Content-Type': 'application/json' } },
//   );

//   const getPriceData: PriceData = await getPriceResponse.json();
//   if (!getPriceResponse.ok) {
//     throw new Error(`Stripe error: ${getPriceData.error}`);
//   }

//   await updateStripeProduct(
//     baseUrl,
//     stripeAccountID,
//     getPriceData?.price?.product,
//     clientData,
//   );

//   await createStripeServicePrice(
//     baseUrl,
//     stripeAccountID,
//     getPriceData?.price?.product,
//     clientData.step_service_price,
//     clientData.step_type_of_service?.recurring_subscription,
//     clientData.step_service_price?.recurrence,
//   );
// };

// Function to update Stripe product
// const updateStripeProduct = async (
//   baseUrl: string,
//   accountId: string,
//   productId: string,
//   clientData: Service.ServiceData,
// ) => {
//   const stripeResponse = await fetch(
//     `${baseUrl}/api/stripe/update-service?productId=${encodeURIComponent(productId)}`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         accountId,
//         name: clientData.step_service_details?.service_name,
//         imageUrl: clientData.step_service_details?.service_image,
//       }),
//     },
//   );

//   const stripeData = await stripeResponse.json();
//   if (!stripeResponse.ok) {
//     throw new Error(`Stripe error: ${stripeData.error}`);
//   }
// };

// Function to create Stripe service price
// const createStripeServicePrice = async (
//   baseUrl: string,
//   accountId: string,
//   productId: string,
//   priceData: Service.ServiceData['step_service_price'],
//   isRecurring: boolean,
//   interval?: string,
// ) => {
//   const unitAmount = (priceData?.price ?? 0) * 100;

//   const stripePriceResponse = await fetch( // Important: This endpoint is not used anymore.
//     `${baseUrl}/api/stripe/create-service-price`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         accountId,
//         productId,
//         unitAmount,
//         currency: 'usd',
//         isRecurring,
//         interval,
//       }),
//     },
//   );

//   const stripePriceData = await stripePriceResponse.json();
//   if (!stripePriceResponse.ok) {
//     throw new Error(`Stripe error: ${stripePriceData.error.message}`);
//   }

//   await updatePriceId(
//     getSupabaseServerComponentClient(),
//     stripePriceData?.priceId,
//   );
// };

// Update price_id in services table
// const updatePriceId = async (client: SupabaseClient, priceId: string) => {
//   const { error: errorResponseUpdateService } = await client
//     .from('services')
//     .update({ price_id: priceId })
//     .eq('price_id', priceId);

//   if (errorResponseUpdateService) {
//     throw new Error(errorResponseUpdateService.message);
//   }
// };