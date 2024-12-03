'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Subscription } from '../../../../../../../../apps/web/lib/subscriptions.types';
import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';
import { fetchCurrentUser } from '../../members/get/get-member-account';


// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const cancelSubscription = async (subscriptionId: string) => {
  const client = getSupabaseServerComponentClient();
  const user = await fetchCurrentUser(client);
  const primary_owner_user_id = await getPrimaryOwnerId();
  const newSubscription: {
    status:
      | 'active'
      | 'trialing'
      | 'past_due'
      | 'canceled'
      | 'unpaid'
      | 'incomplete'
      | 'incomplete_expired'
      | 'paused';
    active: boolean;
  } = {
    active: false,
    status: 'canceled',
  };
  try {
    const { error: updatedSubscriptionError } = await client
      .from('subscriptions')
      .update(newSubscription)
      .eq('id', subscriptionId ?? '')
      .eq('propietary_organization_id', primary_owner_user_id ?? '')
      .single();

    if (updatedSubscriptionError)
      throw new Error(updatedSubscriptionError.message);

    // Get subscription data
    const { data: getSubscriptionData, error: subscriptionError } = await client
      .from('subscriptions')
      .select('billing_customer_id')
      .eq('id', subscriptionId ?? '')
      .eq('propietary_organization_id', primary_owner_user_id ?? '')
      .eq('active', false)
      .single();

    if (subscriptionError)
      throw new Error(`Subscription not found ${subscriptionError.message}`);

    // Generate new susbcription free. See how use platform with new stripe flow ==> Redirect to landing page.
    // Cancel Subscrption on stripe
    const { domain: baseUrl } = await getDomainByUserId(user.id, true);
    const responseCancelSubscription = await fetch(
      `${baseUrl}/api/stripe/cancel-subscription?subscriptionId=${encodeURIComponent(subscriptionId ?? '')}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!responseCancelSubscription.ok) {
      throw new Error('Failed to upgrade subscription');
    }

    // Search Free Subscription
    const priceId = process.env.PLAN_FREE_ID as string;

    // create subscription in stripe
    const subscriptionResponse = await fetch(
      `${baseUrl}/api/stripe/create-subscription?customerId=${encodeURIComponent(getSubscriptionData?.billing_customer_id ?? '')}&priceId=${encodeURIComponent(priceId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!subscriptionResponse.ok) {
      throw new Error('Failed to create subscription');
    }

    const subscriptionData = await subscriptionResponse.clone().json();
    const newDate = new Date().toISOString();
    // Create subscription in db
    const createNewSubscription: Subscription.Type = {
      id: subscriptionData?.id as string,
      propietary_organization_id: primary_owner_user_id as string,
      billing_customer_id: getSubscriptionData?.billing_customer_id ?? '',
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

    const { error: subscriptionCreateError } = await client
      .from('subscriptions')
      .insert(createNewSubscription)
      .single();

    if (subscriptionCreateError) {
      console.error(
        'Error creating subscription:',
        subscriptionCreateError.message,
      );
    }
  } catch (error) {
    console.error('Error fetching products or prices:', error);
    return null;
  }
};