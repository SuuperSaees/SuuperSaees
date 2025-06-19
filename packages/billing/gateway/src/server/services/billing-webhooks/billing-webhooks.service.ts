import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { BillingAccounts } from '../../../../../../../apps/web/lib/billing-accounts.types';
import { Database } from '../../../../../../../apps/web/lib/database.types';
import { Service } from '../../../../../../../apps/web/lib/services.types';
import { Subscription } from '../../../../../../../apps/web/lib/subscriptions.types';
import { Checkout } from '../../../../../../../apps/web/lib/checkout.types';
import { getSessionById } from '../../../../../../features/team-accounts/src/server/actions/sessions/get/get-sessions';
import { createClient } from '../../../../../../features/team-accounts/src/server/actions/clients/create/create-clients';
import { insertServiceToClient } from '../../../../../../features/team-accounts/src/server/actions/services/create/create-service';
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
  private readonly ClientRoleManualPayment = 'client_owner';

  constructor(
    private readonly adminClient: SupabaseClient<Database>,
    private readonly baseUrl: string,
  ) {}

  /**
   * @name handleCheckoutCreatedWebhook
   * @description Handles the webhook for when a checkout is created with manual payment.
   * @param checkout
   */
  async handleCheckoutCreatedWebhook(checkout: Checkout.Type) {
    try {
      // Only process if the provider is 'suuper'
      if (checkout.provider !== 'suuper') {
        console.log(
          `Checkout provider is ${checkout.provider}, not processing manual payment logic`,
        );
        return;
      }

      console.log('Processing manual payment checkout:', checkout.id);

      // 1. Get the session by provider_id
      const session = await getSessionById(checkout.provider_id);

      if (!session) {
        throw new Error(`Session not found for provider_id: ${checkout.provider_id}`);
      }

      // 2. Get the service associated with the checkout
      const { data: checkoutServiceData, error: checkoutServiceError } =
        await this.adminClient
          .from('checkouts')
          .select(
            'id, checkout_services(service_id, services(name, propietary_organization_id))',
          )
          .eq('id', checkout.id)
          .single();

      if (checkoutServiceError) {
        console.error('Error fetching checkout service:', checkoutServiceError);
        throw checkoutServiceError;
      }

      if (!checkoutServiceData?.checkout_services?.[0]) {
        throw new Error(`No service found for checkout: ${checkout.id}`);
      }

      const serviceData = checkoutServiceData.checkout_services[0];
      const serviceId = serviceData.service_id;
      // const serviceName = serviceData.services?.name;
      const agencyOwnerId = serviceData.services?.propietary_organization_id;

      // 3. Get agency information
      const { data: accountDataAgencyOwnerData, error: accountDataAgencyOwnerError } =
        await this.adminClient
          .from('accounts')
          .select('id, organizations(id)')
          .eq('id', agencyOwnerId ?? '')
          .single();

      if (accountDataAgencyOwnerError) {
        console.error('Error fetching agency account:', accountDataAgencyOwnerError);
        throw accountDataAgencyOwnerError;
      }

      const createdBy = accountDataAgencyOwnerData?.id;
      const agencyOrganizationId = Array.isArray(accountDataAgencyOwnerData?.organizations)
        ? accountDataAgencyOwnerData?.organizations[0]?.id
        : accountDataAgencyOwnerData?.organizations?.id;

      // 4. Prepare client data
      const newClient = {
        email: session.client_email ?? '',
        slug: `${session.client_name}'s Organization`,
        name: session.client_name ?? '',
      };

      // 5. Verify if the client already exists
      const { data: accountClientData, error: accountClientError } =
        await this.adminClient
          .from('accounts')
          .select('id')
          .eq('email', newClient.email ?? '')
          .single();

      if (accountClientError && accountClientError.code !== 'PGRST116') {
        console.error('Error fetching user account:', accountClientError);
      }

      let client;
      let clientOrganizationId;
      let clientId;

      // 6. Create client if not exists
      if (!accountClientData) {
        client = await createClient({
          client: newClient,
          role: this.ClientRoleManualPayment,
          agencyId: agencyOrganizationId ?? '',
          adminActivated: true,
        });

        clientOrganizationId = client?.success?.data?.organization_client_id;
        clientId = client?.success?.data?.id;
      } else {
        // 7. If client exists, fetch or create client relationship
        const { data: clientData, error: clientError } = await this.adminClient
          .from('clients')
          .select('id, organization_client_id')
          .eq('user_client_id', accountClientData.id)
          .eq('agency_id', agencyOrganizationId ?? '')
          .single();

        if (clientError && clientError.code !== 'PGRST116') {
          console.error('Error fetching client:', clientError);
        }

        if (clientData) {
          clientId = clientData.id;
          clientOrganizationId = clientData.organization_client_id;
        } else {
          // Create client-agency relationship if not exists
          const { data: createClientData, error: createClientError } =
            await this.adminClient
              .from('clients')
              .insert({
                agency_id: agencyOrganizationId ?? '',
                organization_client_id: clientOrganizationId ?? '',
                user_client_id: accountClientData.id,
              })
              .select('id, organization_client_id')
              .single();

          if (createClientError) {
            console.error('Error creating client relationship:', createClientError);
            throw createClientError;
          }

          clientId = createClientData?.id;
          clientOrganizationId = createClientData?.organization_client_id;
        }
      }

      // 8. Assign the service to the client
      await insertServiceToClient(
        this.adminClient,
        clientOrganizationId ?? '',
        serviceId ?? 0,
        clientId ?? '',
        createdBy ?? '',
        agencyOrganizationId ?? '',
      );

      // 9. Mark the session as deleted
      await this.adminClient
        .from('sessions')
        .update({
          deleted_on: new Date().toISOString(),
        })
        .eq('id', checkout.provider_id);

      console.log('Manual payment checkout processed successfully:', {
        checkoutId: checkout.id,
        clientId,
        serviceId,
        sessionId: checkout.provider_id,
      });

      return {
        success: true,
        checkoutId: checkout.id,
        clientId,
        serviceId,
        clientOrganizationId,
      };
    } catch (error) {
      console.error('Error handling checkout created webhook:', error);
      throw error;
    }
  }

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
 
    const { data: servicesResult, error: servicesError } =
      await this.adminClient
        .from('services')
        .select('*, billing_services(provider)')
        .eq('propietary_organization_id', account.account_id ?? '');

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

  async handleServiceUpdatedWebhook(service: Service.Type, oldService?: Service.Type) {
    // stop bucle if oldService is not provided
    if (!oldService?.price_id && service.price_id) return true;
    const priceChanged = oldService?.price !== service.price;

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
        priceChanged,
      );
    });
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return true;
  }
}