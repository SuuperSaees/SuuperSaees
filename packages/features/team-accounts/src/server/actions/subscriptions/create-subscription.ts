'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const createSubscription = async () => {
  try {
    const client = getSupabaseServerComponentClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      throw new Error('Error to get user account');
    }
    const email = user?.email as string;
    // create customer in stripe
    const customerResponse = await fetch(`${baseUrl}/api/stripe/create-customer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email
        })
    })

    if (!customerResponse.ok) {
        throw new Error('Failed to create customer');
    }
    
    const customerData = (await customerResponse.json())

    // Search Free Subscription
    const priceId = process.env.PLAN_FREE_ID as string;
    // create subscription in stripe
    const subscriptionResponse = await fetch(`${baseUrl}/api/stripe/create-subscription?customerId=${encodeURIComponent(customerData?.id)}&priceId=${encodeURIComponent(priceId)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!subscriptionResponse.ok) {
        throw new Error('Failed to create subscription');
    }
    
    const subscriptionData = (await subscriptionResponse.json())

   // Create subscription in db
    const {data: subscriptionCreateData, error: subscriptionCreateError} = await client
    .from('subscriptions')
    .insert({
        id: subscriptionData?.id,
        account_id: user?.id,
    })
    .select('*')
    .single();

  } catch (error) {
    console.error('Error while creating the organization account:', error);
    throw error;  // Throw the error to ensure the caller knows the function failed
  }
};