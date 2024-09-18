'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';

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
   const primary_owner_user_id = await getPrimaryOwnerId();
   const newSubscription: {
    id: string;
    propietary_organization_id: string;
    billing_customer_id: string;
    active: boolean;
    billing_provider: "stripe" | "lemon-squeezy" | "paddle";
    currency: string;
    status: "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
    cancel_at_period_end: boolean;
    period_starts_at: string | null; 
    period_ends_at?: string | null; 
    trial_ends_at: string | null;
    trial_starts_at: string | null;
    updated_at: string | null;
    created_at?: string | null;
} = {
    id: subscriptionData?.id as string,
    propietary_organization_id: primary_owner_user_id as string,
    billing_customer_id: customerData?.id as string,
    active: true,
    billing_provider: "stripe",
    currency: "usd",
    cancel_at_period_end: false,
    status: "active",
    period_ends_at: null, 
    period_starts_at: null, 
    trial_ends_at: null, 
    trial_starts_at: null, 
    updated_at: null, 
    created_at: null 
};

    const { error: subscriptionCreateError} = await client
    .from('subscriptions')
    .insert(newSubscription)
    .select('*')
    .single();

    console.log('subscriptionCreateError', subscriptionCreateError)
    if (subscriptionCreateError) {
      console.error('Error creating subscription:', subscriptionCreateError.message);
    }
  } catch (error) {
    console.error('Error while creating the organization account:', error);
    throw error;  // Throw the error to ensure the caller knows the function failed
  }
};