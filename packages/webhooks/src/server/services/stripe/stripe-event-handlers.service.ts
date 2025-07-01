import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { BaseWebhookService } from '../shared/base-webhook.service';
import { StripeSubscriptionService } from './stripe-subscription.service';
import { StripeInvoiceService } from './stripe-invoice.service';
import { StripePaymentService } from './stripe-payment.service';
import { getSessionById } from '../../../../../features/team-accounts/src/server/actions/sessions/get/get-sessions';
import { createClient } from '../../../../../features/team-accounts/src/server/actions/clients/create/create-clients';
import { insertServiceToClient } from '../../../../../features/team-accounts/src/server/actions/services/create/create-service';

export class StripeEventHandlersService extends BaseWebhookService {
  private readonly subscriptionService: StripeSubscriptionService;
  private readonly invoiceService: StripeInvoiceService;
  private readonly paymentService: StripePaymentService;

  constructor(adminClient: SupabaseClient<Database>) {
    super(adminClient, '');
    this.subscriptionService = new StripeSubscriptionService(adminClient);
    this.invoiceService = new StripeInvoiceService(adminClient);
    this.paymentService = new StripePaymentService(adminClient);
  }

  private readonly ClientRoleStripeInvitation = 'client_owner';

  async handlePaymentIntentSucceeded(data: any, stripeAccountId: string) {
        try {
          if (stripeAccountId) {
            // Search organization by accountId
            const {
              data: accountDataAgencyOwnerData,
              error: accountDataAgencyOwnerError,
            } = await this.adminClient
              .from('billing_accounts')
              .select('account_id, accounts(id, organizations(id))')
              .eq('provider_id', stripeAccountId)
              .single();

            if (accountDataAgencyOwnerError) {
              console.error(
                'Error fetching organization:',
                accountDataAgencyOwnerError,
              );
              throw accountDataAgencyOwnerError;
            }

            const customer = await getSessionById(data.metadata.sessionId);

            const newClient = {
              email: customer?.client_email ?? '',
              slug: `${customer?.client_name}'s Organization`,
              name: customer?.client_name ?? '',
            };
            const createdBy = accountDataAgencyOwnerData?.account_id;
            const agencyId = Array.isArray(accountDataAgencyOwnerData?.accounts?.organizations) 
              ? accountDataAgencyOwnerData?.accounts?.organizations[0]?.id 
              : accountDataAgencyOwnerData?.accounts?.organizations?.id;

            // Check if the client already exists
            const { data: accountClientData, error: accountClientErrror } =
              await this.adminClient
                .from('accounts')
                .select('id')
                .eq('email', newClient.email ?? '')
                .single();

            if (accountClientErrror) {
              console.error('Error fetching user account: ', accountClientErrror);
            }

            let client;
            if (!accountClientData) {
              client = await createClient({
                client: newClient,
                role: this.ClientRoleStripeInvitation,
                agencyId: agencyId ?? '',
                adminActivated: true,
              });
            }

            let clientOrganizationId;

            if(accountClientData) {
              const { data: clientData, error: clientError} = await this.adminClient
            .from('clients')
            .select('organization_client_id')
            .eq('user_client_id', accountClientData?.id ?? '')
            .eq('agency_id', agencyId ?? '')
            .single();

            if (clientError) {
              console.error('Error fetching client: ', clientError);
            }

            clientOrganizationId = clientData?.organization_client_id;
            }

            // After assign a service to the client, we need to create the subscription
            // Search in the database, by checkout session id

            const { data: checkoutServiceData, error: checkoutServiceError } =
              await this.adminClient
                .from('checkouts')
                .select('id, checkout_services(service_id, services(name))')
                .eq('provider_id', data?.id)
                .single();

            if (checkoutServiceError) {
              console.error(
                'Error fetching checkout service:',
                checkoutServiceError,
              );
              throw checkoutServiceError;
            }

            clientOrganizationId = accountClientData
              ? clientOrganizationId
              : client?.success?.data?.organization_client_id;

            let clientId;

            if (accountClientData) {
              const { data: clientDataWithChecker, error: clientError } =
                await this.adminClient
                  .from('clients')
                  .select('id')
                  .eq('user_client_id', accountClientData.id)
                  .eq('agency_id', agencyId ?? '')
                  .single();

              if (clientError) {
                console.error('Error fetching client:', clientError);
              }
              
              if (clientDataWithChecker) {
                clientId = clientDataWithChecker.id;
              } else {
                const { data: createClientDataWithChecker, error: clientError } =
                await this.adminClient
                  .from('clients')
                  .insert({
                    agency_id: agencyId ?? '',
                    organization_client_id: clientOrganizationId ?? '',
                    user_client_id: accountClientData.id,
                  })
                  .select('id')
                  .single();

                if (clientError) {
                  console.error('Error creating client:', clientError);
                }

                clientId = createClientDataWithChecker?.id;
              }

            } else {
              clientId = client?.success?.data?.id;
            }

            const serviceId = checkoutServiceData?.checkout_services[0]?.service_id;

            await insertServiceToClient(
              this.adminClient,
              clientOrganizationId ?? '',
              serviceId ?? 0,
              clientId ?? '',
              createdBy ?? '',
              agencyId ?? '',
            );

            await this.adminClient
              .from('sessions')
              .update({
                deleted_on: new Date().toISOString(),
              })
              .eq('id', checkoutServiceData?.id);


              // Create the client subscription from Stripe
              await this.subscriptionService.createClientSubscriptionFromStripe({
                clientId: clientId ?? '',
                subscription: data,
              });

              if (!data?.current_period_start && !data?.current_period_end && !data?.trial_start && !data?.trial_end) {
                console.log('Generate local invoice and payment:', data.id);
                // Generate local invoice and payment
                await this.handleOneTimePayment(data, agencyId, clientOrganizationId ?? '', accountClientData?.id ?? client?.success?.data?.user_client_id ?? '', {
                  id: serviceId ?? 0, name: checkoutServiceData?.checkout_services[0]?.services?.name ?? ''});
              }
            } else {
              console.log('Account ID not found in the event');
            }
            return;
          } catch (error) {
            console.error('Error handling subscription session completed:', error);
            return;
          }
  }

  // Expose service methods
  async handleSubscriptionCreated(event: any, stripeAccountId?: string) {
    return this.subscriptionService.handleSubscriptionCreated(event, stripeAccountId);
  }

  async handleSubscriptionUpdated(data: any) {
    return this.subscriptionService.handleSubscriptionUpdated(data);
  }

  async handleSubscriptionDeleted(subscriptionId: string) {
    return this.subscriptionService.handleSubscriptionDeleted(subscriptionId);
  }

  async handleInvoiceCreated(event: any, stripeAccountId?: string) {
    return this.invoiceService.handleInvoiceCreated(event, stripeAccountId);
  }

  async handleInvoiceUpdated(event: any) {
    return this.invoiceService.handleInvoiceUpdated(event);
  }

  async handleInvoicePayment(data: any) {
    return this.invoiceService.handleInvoicePayment(data);
  }

  async handleOneTimePayment(data: any, agencyId: string, clientOrganizationId: string, userClientId: string, service?: { id?: number, name?: string }) {
    return this.paymentService.handleOneTimePayment(data, agencyId, clientOrganizationId, userClientId, service);
  }
}