import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { BillingAccounts } from '../../../../../../../apps/web/lib/billing-accounts.types';
import { Database } from '../../../../../../../apps/web/lib/database.types';
import { Service } from '../../../../../../../apps/web/lib/services.types';
import { Subscription } from '../../../../../../../apps/web/lib/subscriptions.types';
import { getPrimaryOwnerId } from '../../../../../../features/team-accounts/src/server/actions/members/get/get-member-account';
import { createBillingGatewayService } from '../billing-gateway/billing-gateway.service';

export function createBillingWebhooksService(
  adminClient: SupabaseClient<Database>,
  baseUrl: string,
) {
  return new BillingWebhooksService(adminClient, baseUrl);
}

/**
 * @name BillingWebhooksService
 * @description Service for handling billing webhooks.
 */
class BillingWebhooksService {
  constructor(
    private readonly adminClient: SupabaseClient<Database>,
    private readonly baseUrl: string,
  ) {}
  /**
   * @name handleSubscriptionDeletedWebhook
   * @description Handles the webhook for when a subscription is deleted.
   * @param subscription
   */
  async handleSubscriptionDeletedWebhook(subscription: Subscription.Type) {
    const gateway = createBillingGatewayService(
      subscription.billing_provider,
      this.baseUrl,
    );

    const subscriptionData = await gateway.getSubscription(subscription.id);
    const isCanceled = subscriptionData.status === 'canceled';

    if (isCanceled) {
      return;
    }

    return gateway.cancelSubscription({
      subscriptionId: subscription.id,
    });
  }

  async handleBillingAccountCreatedWebhook(account: BillingAccounts.Type) {
    // get primary owner user id from account
    const primaryOwnerId = await getPrimaryOwnerId(
      this.adminClient,
      account.account_id,
    );

    const { data: servicesResult, error: servicesError } =
      await this.adminClient
        .from('services')
        .select('*, billing_services(provider)')
        .eq('propietary_organization_id', primaryOwnerId ?? '');

    if (servicesError) throw new Error(servicesError.message);

    const gateway = createBillingGatewayService(account.provider, this.baseUrl);
    const promises: Promise<unknown>[] = [];
    servicesResult.forEach((service) => {
      const hasBillingService = Array.isArray(service.billing_services)
        ? service.billing_services.find(
            (billingService) => billingService.provider === account.provider,
          )
        : (service.billing_services as unknown as { provider: string })
            .provider;
      if (!hasBillingService) {
        promises.push(gateway.createService(service, account));
      }
    });
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  async handleServiceCreatedWebhook(service: Service.Type) {
    // verify if account has treli enabled
    const [accountsResult, servicesResult] = await Promise.all([
      this.adminClient
        .from('billing_accounts')
        .select('*')
        .eq('account_id', service.propietary_organization_id ?? '')
        .is('deleted_on', null),

      this.adminClient
        .from('billing_services')
        .select('service_id, provider')
        .eq('service_id', service.id),
    ]);
    if (accountsResult.error) throw new Error(accountsResult.error.message);
    if (servicesResult.error) throw new Error(servicesResult.error.message);
    // Create a Set of existing service providers for faster lookup
    const existingProviders = new Set(
      servicesResult.data.map((service) => service.provider),
    );
    // Only create services for providers that don't already have one
    const promises = accountsResult.data
      .filter((account) => !existingProviders.has(account.provider))
      .map((account) => {
        const gateway = createBillingGatewayService(
          account.provider,
          this.baseUrl,
        );
        return gateway.createService(service, account);
      });
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return true;
  }

  async handleServiceUpdatedWebhook(service: Service.Type) {
    // verify if account has treli enabled

    const [accountsResult] = await Promise.all([
      this.adminClient
        .from('billing_accounts')
        .select('*')
        .eq('account_id', service.propietary_organization_id ?? '')
        .is('deleted_on', null),
    ]);
    if (accountsResult.error) throw new Error(accountsResult.error.message);
    const promises = accountsResult.data.map(async (account) => {
      const gateway = createBillingGatewayService(
        account.provider,
        this.baseUrl,
      );
      const { error: billingServicesError, data: billingServicesData } =
        await this.adminClient
          .from('billing_services')
          .select('provider_id')
          .eq('service_id', service.id)
          .single();
      if (billingServicesError) throw new Error(billingServicesError.message);
      return gateway.updateService(
        service,
        account,
        billingServicesData?.provider_id,
      );
    });
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return true;
  }
}