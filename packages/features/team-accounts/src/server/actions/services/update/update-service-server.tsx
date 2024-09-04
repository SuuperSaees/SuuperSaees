'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getPrimaryOwnerId, getStripeAccountID } from '../../members/get/get-member-account';
import { revalidatePath } from 'next/cache';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const updateService = async (id: number, status: string, clientData: {
  step_service_details?: {
  service_image?: string;
  service_name?: string;
  };
  step_service_price?: {
    price_id?: string;
    price?: number;
  };
}) => {
  try {
    const client = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId()
    if (!primary_owner_user_id) throw new Error('No primary owner found');
    const stripe_account_id = await getStripeAccountID();
    if (!stripe_account_id) throw new Error('No stripe account found');      
    const serviceUpdated = {
      status,
      name: clientData.step_service_details?.service_name,
      price: clientData.step_service_price?.price,
    };
    console.log(serviceUpdated, id)

    // Update service in Supabase, services row.
    const { error } = await client
      .from('services')
      .update(serviceUpdated)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    console.log("HOLAAAAA")
    

    // Get Price in Stripe to get productId.
    const priceId= clientData?.step_service_price?.price_id as string;
    const getPriceResponse = await fetch(`${baseUrl}/api/stripe/get-price?accountId=${encodeURIComponent(stripe_account_id)}&priceId=${encodeURIComponent(priceId)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
    },
    })

    const getPriceData = await getPriceResponse.json()

    if (!getPriceResponse.ok) {
      throw new Error(`Stripe error: ${getPriceData.error}`);
    }

    // Update Service in Stripe.
    const stripeResponse = await fetch(`${baseUrl}/api/stripe/update-service?productId=${encodeURIComponent(getPriceData?.product)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accountId: stripe_account_id,
        name: clientData.step_service_details?.service_name,
        imageUrl: clientData.step_service_details?.service_image,
      }),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      throw new Error(`Stripe error: ${stripeData.error}`);
    }
        // Create Price in Stripe 

        const unitPrice = !clientData.step_service_price?.price ?  0 : clientData.step_service_price?.price;
        const unitAmount = unitPrice * 100; 
        const currency = 'usd'; 
        const isRecurring = !!getPriceData?.recurring;
        const interval = getPriceData?.recurring?.interval || null;
    
        const stripePriceResponse = await fetch(`${baseUrl}/api/stripe/create-service-price`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            accountId: stripe_account_id,
            productId: getPriceData?.product,
            unitAmount: unitAmount,
            currency: currency,
            isRecurring,
            interval
          }),
        });
    
        const stripePriceData = await stripePriceResponse.json();
    
        if (!stripePriceResponse.ok) {
          throw new Error(`Stripe error: ${stripePriceData.error.message}`);
        }

        revalidatePath("/services")

  } catch (error) {
    console.error('Error al actualizar el servicio:', error);
  }
};