import { SupabaseClient } from '@supabase/supabase-js';



import { Database } from '@kit/supabase/database';

import { createClient } from '../../../../features/team-accounts/src/server/actions/clients/create/create-clients';
import { getSessionById } from '../../../../features/team-accounts/src/server/actions/sessions/get/get-sessions';
import { insertServiceToClient } from '../../../../features/team-accounts/src/server/actions/services/create/create-service';

export function createWebhookRouterService(
  adminClient: SupabaseClient<Database>,
) {
  return new WebhookRouterService(adminClient);
}

/**
 * @name WebhookRouterService
 * @description Service that routes the webhook event to the appropriate service
 * @param adminClient
 * @param client
 */
class WebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}
  private readonly ClientRoleStripeInvitation = 'client_owner';
  /**
   * @name handleWebhookWithRequest
   * @description Handle the webhook event
   * @param request
   */
  async handleWebhookWithRequest(request: Request) {
    const stripeSignature = request.headers.get('stripe-signature')!;
    if (stripeSignature) {
      const body = await request.text();
      await this.handleStripeWebhook(body, stripeSignature);
    }
  }

  private async handleStripeWebhook(body: string, stripeSignature: string) {
    const { StripeWebhookHandlerService } = await import('@kit/stripe');

    const service = new StripeWebhookHandlerService({
      provider: 'stripe' as 'stripe' | 'lemon-squeezy' | 'paddle',
      products: [],
    });

    const event = await service.verifyWebhookSignatureCustom(
      body,
      stripeSignature,
    );

    const stripeAccountId = event.account;

    await service.handleWebhookEvent(event, {
      onCheckoutSessionCompleted: async (data) => {
        try {
          if (stripeAccountId) {
            // Search organization by accountId
            const {
              data: accountDataAgencyOwnerData,
              error: accountDataAgencyOwnerError,
            } = await this.adminClient
              .from('accounts')
              .select('id, organization_id')
              .eq('stripe_id', stripeAccountId)
              .single();

            if (accountDataAgencyOwnerError) {
              console.error(
                'Error fetching organization:',
                accountDataAgencyOwnerError,
              );
              throw accountDataAgencyOwnerError;
            }

            const newClient = {
              email: data?.customer_details?.email, // TODO: Check if this is the correct field
              slug: `${data?.customer_details?.name}'s Organization`,
              name: data?.customer_details?.name, // TODO: Check if this is the correct field
            };
            const createdBy = accountDataAgencyOwnerData?.id;
            const agencyId = accountDataAgencyOwnerData?.organization_id;

            // Check if the client already exists
            const { data: clientData, error: clientError } =
              await this.adminClient
                .from('accounts')
                .select('id, organization_id')
                .eq('email', newClient.email)
                .eq('is_personal_account', true)
                .single();

            if (clientError) {
              console.error('Error fetching user account:', clientError);
            }
            let client;
            if (!clientData) {
              client = await createClient({
                client: newClient,
                role: this.ClientRoleStripeInvitation,
                agencyId: agencyId ?? '',
                adminActivated: true,
              });
            }

            // After assign a service to the client, we need to create the subscription
            // Search in the database, by checkout session id

            const { data: checkoutServiceData, error: checkoutServiceError } =
              await this.adminClient
                .from('checkouts')
                .select('id, checkout_services(service_id)')
                .eq('provider_id', data?.id)
                .single();

            if (checkoutServiceError) {
              console.error(
                'Error fetching checkout service:',
                checkoutServiceError,
              );
              throw checkoutServiceError;
            }

            const clientOrganizationId = clientData
              ? clientData.organization_id
              : client?.success?.data?.organization_client_id;
            let clientId;
            if (clientData) {
              const { data: clientDataWithChecker, error: clientError } =
                await this.adminClient
                  .from('clients')
                  .select('id')
                  .eq('user_client_id', clientData.id)
                  .single();

              if (clientError) {
                console.error('Error fetching client:', clientError);
              }
              // clientId = clientDataWithChecker?.id ?? client?.success?.data?.id;
              if (clientDataWithChecker) {
                clientId = clientDataWithChecker.id;
              } else {
                const { data: createClientDataWithChecker, error: clientError } =
                await this.adminClient
                  .from('clients')
                  .insert({
                    agency_id: accountDataAgencyOwnerData.organization_id ?? '',
                    organization_client_id: clientOrganizationId ?? '',
                    user_client_id: clientData.id,
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
            await insertServiceToClient(
              this.adminClient,
              clientOrganizationId ?? '',
              checkoutServiceData?.checkout_services[0]?.service_id ?? 0,
              clientId ?? '',
              createdBy ?? '',
              agencyId ?? '',
            );

            await this.adminClient
              .from('checkouts')
              .update({
                deleted_on: new Date().toISOString(),
              })
              .eq('id', checkoutServiceData?.id);
          } else {
            // TODO: Implement logic to handle checkout session completed
            console.log('Account ID not found in the event');
          }
          return;
        } catch (error) {
          console.error('Error handling checkout session completed:', error);
          return;
        }
      },
      onSubscriptionUpdated: async (data) => {
        // No-op or implement logic if needed
        console.log('Subscription updated:', data);
        return Promise.resolve();
      },
      onSubscriptionDeleted: async (subscriptionId) => {
        // No-op or implement logic if needed
        console.log('Subscription deleted:', subscriptionId);
        return Promise.resolve();
      },
      onPaymentSucceeded: async (sessionId) => {
        // No-op or implement logic if needed
        console.log('Payment succeeded:', sessionId);
        return Promise.resolve();
      },
      onPaymentIntentSucceeded: async (data) => {
        console.log('Payment subscription or unique payment succeeded:', data);
        try {
          if (stripeAccountId) {
            // Search organization by accountId
            const {
              data: accountDataAgencyOwnerData,
              error: accountDataAgencyOwnerError,
            } = await this.adminClient
              .from('accounts')
              .select('id, organization_id')
              .eq('stripe_id', stripeAccountId)
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
              email: customer?.client_email ?? '', // TODO: Check if this is the correct field
              slug: `${customer?.client_name}'s Organization`,
              name: customer?.client_name ?? '', // TODO: Check if this is the correct field
            };
            const createdBy = accountDataAgencyOwnerData?.id;
            const agencyId = accountDataAgencyOwnerData?.organization_id;

            // Check if the client already exists
            const { data: clientData, error: clientError } =
              await this.adminClient
                .from('accounts')
                .select('id, organization_id')
                .eq('email', newClient.email ?? '')
                .eq('is_personal_account', true)
                .single();

            if (clientError) {
              console.error('Error fetching user account: ', clientError);
            }
            let client;
            if (!clientData) {
              client = await createClient({
                client: newClient,
                role: this.ClientRoleStripeInvitation,
                agencyId: agencyId ?? '',
                adminActivated: true,
              });
            }


            // After assign a service to the client, we need to create the subscription
            // Search in the database, by checkout session id

            const { data: checkoutServiceData, error: checkoutServiceError } =
              await this.adminClient
                .from('checkouts')
                .select('id, checkout_services(service_id)')
                .eq('provider_id', data?.id)
                .single();

            if (checkoutServiceError) {
              console.error(
                'Error fetching checkout service:',
                checkoutServiceError,
              );
              throw checkoutServiceError;
            }

            const clientOrganizationId = clientData
              ? clientData.organization_id
              : client?.success?.data?.organization_client_id;
            let clientId;
            if (clientData) {
              const { data: clientDataWithChecker, error: clientError } =
                await this.adminClient
                  .from('clients')
                  .select('id')
                  .eq('user_client_id', clientData.id)
                  .single();

              if (clientError) {
                console.error('Error fetching client:', clientError);
              }
              // clientId = clientDataWithChecker?.id ?? client?.success?.data?.id;
              if (clientDataWithChecker) {
                clientId = clientDataWithChecker.id;
              } else {
                const { data: createClientDataWithChecker, error: clientError } =
                await this.adminClient
                  .from('clients')
                  .insert({
                    agency_id: accountDataAgencyOwnerData.organization_id ?? '',
                    organization_client_id: clientOrganizationId ?? '',
                    user_client_id: clientData.id,
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
            await insertServiceToClient(
              this.adminClient,
              clientOrganizationId ?? '',
              checkoutServiceData?.checkout_services[0]?.service_id ?? 0,
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


          } else {
            // TODO: Implement logic to handle checkout session completed
            console.log('Account ID not found in the event');
          }
          return;
        } catch (error) {
          console.error('Error handling suscribtion session completed:', error);
          return;
        }
      },
      onPaymentFailed: async (sessionId) => {
        // No-op or implement logic if needed
        console.log('Payment failed:', sessionId);
        return Promise.resolve();
      },
      onInvoicePaid: async (data) => {
        // No-op or implement logic if needed
        console.log('Invoice paid:', data);
        return Promise.resolve();
      },
      onEvent: async (event) => {
        // No-op or implement logic if needed
        console.log('Event:', event);
        return Promise.resolve();
      },
    });
  }
}