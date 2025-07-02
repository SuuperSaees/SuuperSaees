'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Subscription } from '../../../../../../../../apps/web/lib/subscriptions.types';
// import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';
import { getSession } from '../../../../../../../../apps/web/app/server/actions/accounts/accounts.action';

// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const createSubscription = async (): Promise<{
  userId: string;
} | { error: string }> => {
  try {
    const client = getSupabaseServerComponentClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return { error: 'Error to get user account' };
    }

    const email = user?.email as string;

    let userBaseUrl = `${(await getSession())?.organization?.domain}`;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!userBaseUrl) {
      if (typeof window !== 'undefined') {
        userBaseUrl = window.location.origin;
      }
    }

    const customerResponse = await fetch(
      `${baseUrl}/api/stripe/create-customer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      },
    );

    if (!customerResponse.ok) {
      console.error('Failed to create customer. Status:', customerResponse.status);
      throw new Error('Failed to create customer');
    }

    const customerData = await customerResponse.clone().json();

    const priceId = process.env.PLAN_FREE_ID as string;

    const subscriptionResponse = await fetch(
      `${baseUrl}/api/stripe/create-subscription?customerId=${encodeURIComponent(customerData?.id)}&priceId=${encodeURIComponent(priceId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!subscriptionResponse.ok) {
      console.error(
        'Failed to create subscription. Status:',
        subscriptionResponse.status,
      );
      throw new Error('Failed to create subscription');
    }

    const subscriptionData = await subscriptionResponse.clone().json();

    const primary_owner_user_id = await getPrimaryOwnerId(undefined, true);

    const newDate = new Date().toISOString();
    const newSubscription: Subscription.Type = {
      id: subscriptionData?.id as string,
      propietary_organization_id: primary_owner_user_id as string,
      billing_customer_id: customerData?.id as string,
      active: true,
      billing_provider: 'stripe',
      currency: 'usd',
      cancel_at_period_end: false,
      status: 'active',
      period_ends_at: null,
      period_starts_at: null,
      trial_ends_at: null,
      trial_starts_at: null,
      updated_at: newDate,
      created_at: newDate,
      account_id: null,
    };

    const { error: subscriptionCreateError} = await client
      .from('subscriptions')
      .insert(newSubscription)
      .select('*')
      .single();

    
    if (subscriptionCreateError) {
      console.error(
        'Error creating subscription in database:',
        subscriptionCreateError.message,
        'Full error:',
        subscriptionCreateError
      );
      return { error: subscriptionCreateError.message };
    }
    return { userId: user.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in createSubscription:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return { error: errorMessage };
  }
};