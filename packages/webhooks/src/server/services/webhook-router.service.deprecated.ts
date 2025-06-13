import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { createClient } from '../../../../features/team-accounts/src/server/actions/clients/create/create-clients';
import { getSessionById } from '../../../../features/team-accounts/src/server/actions/sessions/get/get-sessions';
import { insertServiceToClient } from '../../../../features/team-accounts/src/server/actions/services/create/create-service';
import { RetryOperationService } from '@kit/shared/utils';
import { Activity } from '../../../../../apps/web/lib/activity.types';

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
         console.log('onCheckoutSessionCompleted', data);
        return await Promise.resolve()
      },
      
      onSubscriptionUpdated: async (data) => {
        console.log('Subscription updated:', data);
        await this.handleSubscriptionUpdated(data);
        return Promise.resolve();
      },
      
      onSubscriptionDeleted: async (subscriptionId) => {
        console.log('Subscription deleted:', subscriptionId);
        await this.handleSubscriptionDeleted(subscriptionId);
        return Promise.resolve();
      },
      
      onPaymentSucceeded: async (sessionId) => {
        console.log('Payment succeeded:', sessionId);
        return Promise.resolve();
      },
      
      onPaymentIntentSucceeded: async (data) => {
        console.log('onPaymentIntentSucceeded', data);
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

            console.log('checkoutServiceData', data?.id);

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
              await this.createClientSubscriptionFromStripe({
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
        },
      
      onPaymentFailed: async (sessionId) => {
        console.log('Payment failed:', sessionId);
        return Promise.resolve();
      },
      
      onInvoicePaid: async (data) => {
        await this.handleInvoicePayment(data);
        return Promise.resolve();
      },

      onInvoiceCreated: async (data) => {
        console.log('Invoice created:', data);
        await this.handleInvoiceCreated(event, stripeAccountId);
        return Promise.resolve();
      },

      onInvoiceUpdated: async (data) => {
        console.log('Invoice updated:', data);
        await this.handleInvoiceUpdated(data);
        return Promise.resolve();
      },
      
      onEvent: async (event) => {
        console.log('Processing event:', event.type);

        if (event.type === 'customer.subscription.created') {
          await this.handleSubscriptionCreated(event, stripeAccountId);
        }
        
        return Promise.resolve();
      },
    });
  }

  // New added methods to handle Stripe events

  private async handleSubscriptionCreated(event: any, stripeAccountId?: string) {
    try {
      if (!stripeAccountId) {
        console.log('No Stripe account ID found for subscription created');
        return;
      }

      const subscription = event.data.object;
      console.log('Processing subscription created:', subscription.id);

      // Buscar la agencia por el Stripe account ID
      const { data: billingAccount, error: billingError } = await this.adminClient
        .from('billing_accounts')
        .select('account_id, accounts(id, organizations(id))')
        .eq('provider_id', stripeAccountId)
        .single();

      if (billingError ?? !billingAccount) {
        console.error('Error fetching billing account:', billingError);
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
        console.error('Error checking existing subscription:', existingError);
        return;
      }

      if (existingClientSub) {
        console.log('Subscription already exists, updating...');
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
        console.log('No existing client found, this subscription might be orphaned');
        return;
      }

      // Crear la subscription en nuestra base de datos
      await this.createClientSubscriptionFromStripe({
        clientId: clientId,
        subscription,
      });

      console.log('Client subscription created successfully');

    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  private async handleSubscriptionUpdated(data: any) {
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
        await this.updateClientSubscriptionFromData(subscription, existingSubscription.id);
      }

    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  private async handleSubscriptionDeleted(subscriptionId: string) {
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
      }
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
    }
  }

  private async handleInvoiceCreated(event: any, stripeAccountId?: string) {
    try {
      if (!stripeAccountId) {
        console.log('No Stripe account ID found for invoice created');
        return;
      }

      const invoice = event.data.object;

      const retryOperation = new RetryOperationService(
        async () => {
          // Search for the billing account by Stripe account ID
          const { data: billingAccount, error: billingError } = await this.adminClient
            .from('billing_accounts')
            .select('account_id, accounts(id, organizations(id))')
            .eq('provider_id', stripeAccountId)
            .single();

          if (billingError ?? !billingAccount) {
            console.error('Error fetching billing account:', billingError);
            throw new Error('Billing account not found');
          }

          // Search for the client subscription by customer ID
          const { data: clientSubscription, error: clientError } = await this.adminClient
            .from('client_subscriptions')
            .select('client_id, clients(organization_client_id, user_client_id)')
            .eq('billing_customer_id', invoice.customer)
            .eq('billing_provider', 'stripe')
            .single();

          if (clientError ?? !clientSubscription) {
            console.error('Error fetching client by customer_id:', clientError);
            throw new Error('Client subscription not found');
          }

          // Search Billing Services
          const { data: billingServices, error: serviceError } = await this.adminClient
            .from('billing_services')
            .select('service_id')
            .eq('provider_id', invoice.lines.data[0].price.id)
            .eq('provider', 'stripe')
            .single();

          if (serviceError) {
            console.error('Error fetching billing services:', serviceError);
            throw new Error('Billing services not found');
          }

          const agencyId = billingAccount.accounts?.organizations[0]?.id ?? '';
          const clientOrganizationId = Array.isArray(clientSubscription.clients?.organization_client_id)
            ? clientSubscription.clients.organization_client_id[0]
            : clientSubscription.clients?.organization_client_id;
          const userClientId = clientSubscription.clients?.user_client_id ?? '';
          const serviceId = billingServices.service_id;

          // Create the invoice in our database
          await this.createInvoiceFromStripe({
            invoice,
            agencyId,
            clientOrganizationId,
            userClientId,
            serviceId
          });

          console.log('Invoice created successfully from Stripe');
        },
        {
          maxAttempts: 3,
          backoffFactor: 2,
          delayMs: 15000,
        }
      );

      await retryOperation.execute();

    } catch (error) {
      console.error('Error handling invoice created:', error);
    }
  }

  private async handleInvoiceUpdated(event: any) {
    try {
      const invoice = event;

      // Search for the existing invoice in our database
      const { data: existingInvoice, error: invoiceError } = await this.adminClient
        .from('invoices')
        .select('id, status, client_organization_id')
        .eq('provider_id', invoice.id)
        .single();

      if (invoiceError) {
        console.error('Error fetching existing invoice:', invoiceError);
        return;
      }

      if (existingInvoice) {
        // Update status and other fields
        const updateData: any = {
          status: this.mapStripeInvoiceStatus(invoice.status),
          updated_at: new Date().toISOString(),
        };

        console.log('Updating invoice:', existingInvoice.id, 'with status:', updateData.status);

        // If the invoice was paid, record the payment
        if (invoice.status === 'paid' && existingInvoice.status !== 'paid') {
          console.log('Invoice paid, recording payment:', invoice.id);
          await this.recordInvoicePayment({
            invoiceId: existingInvoice.id,
            invoice,
          });
        }

        const { error: updateError } = await this.adminClient
          .from('invoices')
          .update(updateData)
          .eq('id', existingInvoice.id);

        if (updateError) {
          throw new Error(`Failed to update invoice: ${updateError.message}`);
        }

        // get user client id from client_subscriptions
        const { data: clientSubscription, error: clientSubError } = await this.adminClient
          .from('client_subscriptions')
          .select('clients(user_client_id)')
          .eq('billing_customer_id', invoice.customer)
          .eq('billing_provider', 'stripe')
          .single();

        if (clientSubError) {
          console.error('Error fetching client subscription:', clientSubError);
          return;
        }

        const userClientId = clientSubscription?.clients?.user_client_id;

        // Create activity for invoice update
        await this.createActivity({
          action: 'update',
          actor: 'System',
          message: `has updated`,
          type: Activity.Enums.ActivityType.INVOICE,
          invoiceId: existingInvoice.id,
          clientId: userClientId,
          value: 'paid',
        });
      }

    } catch (error) {
      console.error('Error handling invoice updated:', error);
    }
  }

  private async handleInvoicePayment(data: any) {
    console.log('Handling invoice payment:', data);
    const retryOperation = new RetryOperationService(
      async () => {
        // get invoice id from invoices 
        const { data: invoiceData, error: invoiceError } = await this.adminClient
        .from('invoices')
        .select('id')
        .eq('provider_id', data.id)
        .single()

        if(invoiceError) {
          throw new Error(`Failed to get Invoice ${invoiceError.message}`)
        }

        await this.recordInvoicePayment({
        invoiceId: invoiceData.id,
        invoice: data,
      }).catch((error) => {
        console.error('Error recording invoice payment:', error);
      });
      },
      {
          maxAttempts: 3,
          backoffFactor: 2,
          delayMs: 20000,
      }
    )
    await retryOperation.execute()
  }

  // Method to create an local invoice
  private async handleOneTimePayment(data: any, agencyId: string, clientOrganizationId: string, userClientId: string, service?: { id?: number, name?: string }) {
    try {
      // Create the local invoice
      const invoiceId = await this.createLocalInvoiceForOneTimePayment({
        agencyId: agencyId,
        clientOrganizationId: clientOrganizationId,
        userClientId: userClientId,
        service,
        paymentIntentId: data.id,
        amount: data.amount / 100, // Stripe amounts are in cents
        currency: data.currency,
      });

      // Record the payment
      await this.recordLocalPaymentForOneTimePayment({
        invoiceId: invoiceId,
        paymentIntentId: data.id,
        amount: data.amount / 100,
      });

      console.log('One-time payment processed successfully');

    } catch (error) {
      console.error('Error handling one-time payment:', error);
    }
  }

  // Método para crear invoice local para pagos únicos
  private async createLocalInvoiceForOneTimePayment({
    agencyId,
    clientOrganizationId,
    userClientId,
    paymentIntentId,
    amount,
    currency,
    service
  }: {
    agencyId: string;
    clientOrganizationId: string;
    userClientId: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    service?: { name?: string; id?: number;  };
  }) {
    console.log('Creating local invoice for one-time payment:', paymentIntentId);

    const dueDate = new Date().toISOString()

    const invoiceData = {
      agency_id: agencyId,
      client_organization_id: clientOrganizationId,
      number: '', 
      issue_date: dueDate,
      due_date: dueDate, 
      status: 'paid' as const, 
      subtotal_amount: amount,
      tax_amount: 0,
      total_amount: amount,
      currency: currency.toUpperCase(),
      provider_id: paymentIntentId,
      checkout_url: null,
    };

    const { data: createdInvoice, error: invoiceError } = await this.adminClient
      .from('invoices')
      .insert(invoiceData)
      .select('id, number')
      .single();

    if (invoiceError) {
      throw new Error(`Failed to create local invoice: ${invoiceError.message}`);
    }

    // Create a invoice
    const invoiceItemData = {
      invoice_id: createdInvoice.id,
      service_id: service?.id ?? 0,
      description: service?.name ?? 'Service',
      quantity: 1,
      unit_price: amount,
      total_price: amount,
    };

    const { error: itemError } = await this.adminClient
      .from('invoice_items')
      .insert(invoiceItemData);

    if (itemError) {
      console.error('Error creating invoice item:', itemError);
    }

    // Create activity for invoice creation
    await this.createActivity({
      action: 'create',
      actor: 'System',
      message: `has created`,
      type: Activity.Enums.ActivityType.INVOICE,
      clientId: userClientId,
      invoiceId: createdInvoice.id,
      value: createdInvoice.number,
    });

    return createdInvoice.id;
  }

  // Método para registrar pago local para pagos únicos
  private async recordLocalPaymentForOneTimePayment({
    invoiceId,
    paymentIntentId,
    amount,
  }: {
    invoiceId: string;
    paymentIntentId: string;
    amount: number;
  }) {
    const paymentData = {
      invoice_id: invoiceId,
      payment_method: 'stripe' as const,
      amount: amount,
      status: 'succeeded' as const,
      provider_payment_id: paymentIntentId,
      processed_at: new Date().toISOString(),
    };

    const { error: paymentError } = await this.adminClient
      .from('invoice_payments')
      .insert(paymentData);

    if (paymentError) {
      console.error('Error recording local payment:', paymentError);
      throw new Error(`Failed to record local payment: ${paymentError.message}`);
    }

    console.log('Local payment recorded successfully for payment intent:', paymentIntentId);
  }

  // Auxiliar Methods

  private async createClientSubscriptionFromStripe({
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
      active: subscription.status === 'active' ?? subscription.status === 'trialing',
    };

    const { error: insertError } = await this.adminClient
      .from('client_subscriptions')
      .upsert(subscriptionData, { 
          onConflict: 'billing_customer_id,billing_provider' 
        });(subscriptionData);

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
      active: subscription.status === 'active' ?? subscription.status === 'trialing',
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

  private async updateClientSubscriptionFromData(subscription: any, subscriptionId: string) {

    const updateData = {
      status: subscription.status,
      active: subscription.active,
      updated_at: new Date().toISOString() ?? '',
      period_starts_at: new Date(subscription.current_period_start * 1000).toISOString() ?? '',
      period_ends_at: new Date(subscription.current_period_end * 1000).toISOString() ?? '',
      trial_starts_at: new Date(subscription.trial_start * 1000).toISOString() ?? '',
      trial_ends_at: new Date(subscription.trial_end * 1000).toISOString() ?? '',
    };

    const { error: updateError } = await this.adminClient
      .from('client_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update client subscription: ${updateError.message}`);
    }
  }

  private async createInvoiceFromStripe({
    invoice,
    agencyId,
    clientOrganizationId,
    userClientId,
    serviceId
  }: {
    invoice: any;
    agencyId: string;
    serviceId: number;
    clientOrganizationId: string;
    userClientId?: string
  }) {
    console.log('Creating invoice from Stripe:', invoice.id);
    const mappedStatus = this.mapStripeInvoiceStatus(invoice.status) ?? 'draft'
    const invoiceData = {
      agency_id: agencyId,
      client_organization_id: clientOrganizationId,
      number: '',
      issue_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
      due_date: (invoice.due_date 
        ? new Date(invoice.due_date * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) ?? '',
      status: mappedStatus,
      subtotal_amount: invoice.subtotal / 100,
      tax_amount: invoice.tax ?? 0,
      total_amount: invoice.total / 100,
      currency: invoice.currency.toUpperCase(),
      provider_id: invoice.id,
      checkout_url: invoice.hosted_invoice_url,
    };

    const { data: createdInvoice, error: invoiceError } = await this.adminClient
      .from('invoices')
      .insert(invoiceData)
      .select('id, number')
      .single();

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    // Create invoice items if they exist
    if (invoice.lines && invoice.lines.data.length > 0) {
      const invoiceItems = invoice.lines.data.map((line: any) => ({
        invoice_id: createdInvoice.id,
        service_id: serviceId,
        description: line.description ?? 'Service item',
        quantity: line.quantity ?? 1,
        unit_price: line.amount / 100,
        total_price: line.amount / 100,
      }));

      const { error: itemsError } = await this.adminClient
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError);
      }
    }

    // Create activity for invoice creation
    await this.createActivity({
      action: 'create',
      actor: 'System',
      message: `has created`,
      type: Activity.Enums.ActivityType.INVOICE,
      clientId: userClientId,
      invoiceId: createdInvoice.id,
      value: createdInvoice.number,
    });

    return createdInvoice.id;
  }

  private async recordInvoicePayment({
    invoiceId,
    invoice,
  }: {
    invoiceId: string;
    invoice: any;
  }) {
    const paymentData = {
      invoice_id: invoiceId,
      payment_method: 'stripe' as const,
      amount: invoice.amount_paid / 100,
      status: 'succeeded' as const,
      provider_payment_id: invoice.payment_intent ?? invoice.id,
      processed_at: new Date().toISOString(),
    };

    const { error: paymentError } = await this.adminClient
      .from('invoice_payments')
      .insert(paymentData);

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
    }
  }

  private mapStripeInvoiceStatus(stripeStatus: string): 'draft' | 'issued' | 'paid' | 'overdue' | 'voided' {
    const statusMap: Record<string, 'draft' | 'issued' | 'paid' | 'overdue' | 'voided'> = {
      'draft': 'draft',
      'open': 'issued',
      'paid': 'paid',
      'uncollectible': 'overdue',
      'void': 'voided',
    };

    return statusMap[stripeStatus] ?? 'draft';
  }

  private async createActivity({
    action,
    actor,
    message,
    type,
    clientId,
    invoiceId,
    value,
  }: {
    action: 'create' | 'update' | 'delete';
    actor: string;
    message: string;
    type: Activity.Enums.ActivityType;
    value: string;
    clientId?: string;
    invoiceId?: string;
  }) {
    try {
      const activityData = {
        action,
        actor,
        message,
        type,
        preposition: 'to',
        value,
        reference_id: invoiceId ?? null,
        user_id: clientId ?? '',
      };

      const { error } = await this.adminClient
        .from('activities')
        .insert(activityData);

      if (error) {
        console.error('Error creating activity:', error);
      }
    } catch (error) {
      console.error('Error in createActivity:', error);
    }
  }
}