import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { BaseWebhookService } from '../shared/base-webhook.service';

export class StripeSubscriptionService extends BaseWebhookService {
  constructor(adminClient: SupabaseClient<Database>) {
    super(adminClient);
  }

  async handleSubscriptionCreated(event: any, stripeAccountId?: string) {
    try {
      if (!stripeAccountId) {
        console.log('No stripe account ID provided');
        return;
      }

      const subscription = event.data.object;
      console.log('Processing subscription created:', subscription.id);

      // Search for the billing account using the Stripe account ID
      const { data: billingAccount, error: billingError } = await this.adminClient
        .from('billing_accounts')
        .select('account_id, accounts(id, organizations(id))')
        .eq('provider_id', stripeAccountId)
        .single();

      if (billingError ?? !billingAccount) {
        console.error('Error finding billing account:', billingError);
        return;
      }

      const agencyId = Array.isArray(billingAccount.accounts?.organizations) 
        ? billingAccount.accounts.organizations[0]?.id 
        : billingAccount.accounts?.organizations?.id;

      // Search for existing client subscription by customer ID
      const { data: existingClientSub, error: existingError } = await this.adminClient
        .from('client_subscriptions')
        .select('id')
        .eq('billing_customer_id', subscription.customer)
        .eq('billing_provider', 'stripe')
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing client subscription:', existingError);
        return;
      }

      if (existingClientSub) {
        console.log('Client subscription already exists, updating instead');
        await this.updateClientSubscription(subscription, existingClientSub.id);
        return;
      }

      // Search for the client in the database
      const { data: existingClient, error: clientError } = await this.adminClient
        .from('clients')
        .select('id, organization_client_id, user_client_id')
        .eq('agency_id', agencyId)
        .limit(1)
        .single();

      if (clientError && clientError.code !== 'PGRST116') {
        console.error('Error fetching client:', clientError);
        return;
      }

      const clientId = existingClient?.id ?? '';

      if (!existingClient) {
        console.log('No client found for agency:', agencyId);
        return;
      }

      // Create a new client subscription
      await this.createClientSubscriptionFromStripe({
        clientId: clientId,
        subscription,
      });

      console.log('Client subscription created successfully');

    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  async handleSubscriptionUpdated(data: any) {
    try {
      const subscription = data;

      // Buscar la subscription existente
      const subscriptionId = subscription.id ?? subscription.target_subscription_id;
      const { data: existingSubscription, error: subError } = await this.adminClient
        .from('client_subscriptions')
        .select('id, client_id')
        .eq('billing_subscription_id', subscriptionId)
        .eq('billing_provider', 'stripe')
        .single();

      if (subError) {
        console.error('Error fetching existing subscription:', subError);
        return;
      }

      if (existingSubscription) {
        await this.updateClientSubscription(subscription, existingSubscription.id);
        console.log('Subscription updated successfully');
      }

    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  async handleSubscriptionDeleted(subscriptionId: string) {
    try {
      const { error } = await this.adminClient
        .from('client_subscriptions')
        .update({ 
          active: false, 
          deleted_on: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('billing_subscription_id', subscriptionId)
        .eq('billing_provider', 'stripe');

      if (error) {
        console.error('Error deleting subscription:', error);
      } else {
        console.log('Subscription deleted successfully');
      }
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
    }
  }

  async createClientSubscriptionFromStripe({
    clientId,
    subscription,
  }: {
    clientId: string;
    subscription: any;
  }) {
    const subscriptionData = {
      client_id: clientId,
      billing_subscription_id: subscription.id,
      billing_customer_id: subscription.customer,
      billing_provider: 'stripe' as const,
      period_starts_at: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      period_ends_at: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      trial_starts_at: subscription.trial_start 
        ? new Date(subscription.trial_start * 1000).toISOString() 
        : null,
      trial_ends_at: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
      currency: subscription.currency,
      status: subscription.status,
      active: subscription.status === 'active' || subscription.status === 'trialing',
    };

    const { error: insertError } = await this.adminClient
      .from('client_subscriptions')
      .upsert(subscriptionData, { 
        onConflict: 'billing_customer_id,billing_provider' 
      });

    if (insertError) {
      throw new Error(`Failed to create client subscription: ${insertError.message}`);
    }
  }

  private async updateClientSubscription(subscription: any, subscriptionId: string) {
    const updateData = {
      period_starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
      period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_starts_at: subscription.trial_start 
        ? new Date(subscription.trial_start * 1000).toISOString() 
        : null,
      trial_ends_at: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
      status: subscription.status,
      active: subscription.status === 'active' || subscription.status === 'trialing',
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await this.adminClient
      .from('client_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update client subscription: ${updateError.message}`);
    }
  }

  async updateClientSubscriptionFromData(subscription: any, subscriptionId: string) {
    const updateData = {
      status: subscription.status,
      active: subscription.active,
      updated_at: new Date().toISOString(),
      period_starts_at: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      period_ends_at: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      trial_starts_at: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    };

    const { error: updateError } = await this.adminClient
      .from('client_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('Error updating client subscription from data:', updateError);
    }
  }
}