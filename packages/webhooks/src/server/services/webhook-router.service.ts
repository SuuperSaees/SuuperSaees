import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { ClientSubscriptions } from '../../../../../apps/web/lib/client-subscriptions.types'

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
         console.log('onCheckoutSessionCompleted', data);
        return await Promise.resolve()
      },
      
      onSubscriptionUpdated: async (data) => {
        console.log('Subscription updated:', data);
        await this.handleSubscriptionUpdated(data, stripeAccountId);
        return Promise.resolve();
      },
      
      onSubscriptionDeleted: async (subscriptionId) => {
        console.log('Subscription deleted:', subscriptionId);
        await this.handleSubscriptionDeleted(subscriptionId, stripeAccountId);
        return Promise.resolve();
      },
      
      onPaymentSucceeded: async (sessionId) => {
        console.log('Payment succeeded:', sessionId);
        return Promise.resolve();
      },
      
      onPaymentIntentSucceeded: async (data) => {
        console.log('onPaymentIntentSucceeded', data);
        try {
          // Mantener toda la lógica existente
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

            console.log('Client created or fetched:', client);

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

            // NUEVA FUNCIONALIDAD: Crear client_subscription con customer_id
            if (data.customer && clientId) {
              await this.createClientSubscription({
                clientId,
                customerId: data.customer,
                subscriptionId: data.id,
                agencyId: agencyId ?? '',
              });
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
        console.log('Invoice paid:', data);
        await this.handleInvoicePayment(data, stripeAccountId);
        return Promise.resolve();
      },

      onInvoiceCreated: async (data) => {
        console.log('Invoice created:', data);
        await this.handleInvoiceCreated(event, stripeAccountId);
        return Promise.resolve();
      },

      onInvoiceUpdated: async (data) => {
        console.log('Invoice updated:', data);
        await this.handleInvoiceUpdated(data, stripeAccountId);
        return Promise.resolve();
      },
      
      onEvent: async (event) => {
        console.log('Processing event:', event.type);
        
        // NUEVA FUNCIONALIDAD: Manejar eventos adicionales
        if (event.type === 'invoice.created') {
          await this.handleInvoiceCreated(event, stripeAccountId);
        } else if (event.type === 'invoice.updated') {
          await this.handleInvoiceUpdated(event, stripeAccountId);
        } else if (event.type === 'customer.subscription.created') {
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

      if (billingError || !billingAccount) {
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

      let clientId = existingClient?.id;

      if (!existingClient) {
        console.log('No existing client found, this subscription might be orphaned');
        return;
      }

      // Crear la subscription en nuestra base de datos
      await this.createClientSubscriptionFromStripe({
        clientId: clientId!,
        subscription,
        agencyId: agencyId!,
      });

      console.log('Client subscription created successfully');

    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  private async handleSubscriptionUpdated(data: any, stripeAccountId?: string) {
    try {
      const subscription = data;
      console.log('Processing subscription updated:', subscription.id || subscription.target_subscription_id);

      // Buscar la subscription existente
      const subscriptionId = subscription.id || subscription.target_subscription_id;
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
        
        // Crear actividad
        await this.createActivity({
          action: 'update',
          actor: 'System',
          message: `Subscription updated: ${subscription.status}`,
          type: 'billing',
          clientId: existingSubscription.client_id,
        });
      }

    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  private async handleSubscriptionDeleted(subscriptionId: string, stripeAccountId?: string) {
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
      console.log('Processing invoice created:', invoice.id);

      // Buscar la agencia por el Stripe account ID
      const { data: billingAccount, error: billingError } = await this.adminClient
        .from('billing_accounts')
        .select('account_id, accounts(id, organizations(id))')
        .eq('provider_id', stripeAccountId)
        .single();

      if (billingError || !billingAccount) {
        console.error('Error fetching billing account:', billingError);
        return;
      }

      // Search for the client subscription by customer ID
      const { data: clientSubscription, error: clientError } = await this.adminClient
        .from('client_subscriptions')
        .select('client_id, clients(organization_client_id)')
        .eq('billing_customer_id', invoice.customer)
        .eq('billing_provider', 'stripe')
        .single();

      if (clientError || !clientSubscription) {
        console.error('Error fetching client by customer_id:', clientError);
        return;
      }

      const agencyId = billingAccount.account_id;
      const clientOrganizationId = Array.isArray(clientSubscription.clients?.organization_client_id)
        ? clientSubscription.clients.organization_client_id[0]
        : clientSubscription.clients?.organization_client_id;

      // Crear la factura
      await this.createInvoiceFromStripe({
        invoice,
        agencyId,
        clientOrganizationId,
        clientId: clientSubscription.client_id,
      });

      console.log('Invoice created successfully from Stripe');

    } catch (error) {
      console.error('Error handling invoice created:', error);
    }
  }

  private async handleInvoiceUpdated(event: any, stripeAccountId?: string) {
    try {
      const invoice = event.data.object;
      console.log('Processing invoice updated:', invoice.id);

      // Buscar la factura existente
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
        // Actualizar status y otros campos
        const updateData: any = {
          status: this.mapStripeInvoiceStatus(invoice.status),
          updated_at: new Date().toISOString(),
        };
        // Remove created_at if it's null to satisfy type requirements
        if (invoice.created_at !== undefined && invoice.created_at !== null) {
          updateData.created_at = invoice.created_at;
        }

        // Si la factura fue pagada, registrar el pago
        if (invoice.status === 'paid' && existingInvoice.status !== 'paid') {
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

        // Crear actividad
        await this.createActivity({
          action: 'update',
          actor: 'System',
          message: `Invoice updated: ${invoice.status}`,
          type: 'billing',
          invoiceId: existingInvoice.id,
        });
      }

    } catch (error) {
      console.error('Error handling invoice updated:', error);
    }
  }

  private async handleInvoicePayment(data: any, stripeAccountId?: string) {
    console.log('Handling invoice payment:', data);
    // Aquí puedes agregar lógica adicional si es necesaria
  }

  // MÉTODOS AUXILIARES

  private async createClientSubscription({
    clientId,
    customerId,
    subscriptionId,
    agencyId,
  }: {
    clientId: string;
    customerId: string;
    subscriptionId: string;
    agencyId: string;
  }) {
    try {
      const subscriptionData = {
        client_id: clientId,
        billing_subscription_id: subscriptionId,
        billing_customer_id: customerId,
        billing_provider: 'stripe' as const,
        period_starts_at: new Date().toISOString(),
        period_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días por defecto
        currency: 'USD',
        status: 'active',
        active: true,
      };

      const { error: upsertError } = await this.adminClient
        .from('client_subscriptions')
        .upsert(subscriptionData, { 
          onConflict: 'billing_customer_id,billing_provider' 
        });

      if (upsertError) {
        console.error('Failed to create or update client subscription:', upsertError);
      } else {
        console.log('Client subscription created with customer_id:', customerId);
      }
    } catch (error) {
      console.error('Error in createClientSubscription:', error);
    }
  }

  private async createClientSubscriptionFromStripe({
    clientId,
    subscription,
    agencyId,
  }: {
    clientId: string;
    subscription: any;
    agencyId: string;
  }) {
    const subscriptionData = {
      client_id: clientId,
      billing_subscription_id: subscription.id,
      billing_customer_id: subscription.customer,
      billing_provider: 'stripe' as const,
      period_starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
      period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
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
      .insert(subscriptionData);

    if (insertError) {
      throw new Error(`Failed to create client subscription: ${insertError.message}`);
    }

    // Crear actividad
    await this.createActivity({
      action: 'create',
      actor: 'System',
      message: `New subscription created: ${subscription.status}`,
      type: 'billing',
      clientId,
    });
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

  private async updateClientSubscriptionFromData(subscription: any, subscriptionId: string) {
    const updateData: ClientSubscriptions.Update = {
      status: subscription.status,
      active: subscription.active,
      updated_at: new Date().toISOString()
    };

    if (subscription.period_starts_at) {
      updateData.period_starts_at = subscription.period_starts_at;
    }
    if (subscription.period_ends_at) {
      updateData.period_ends_at = subscription.period_ends_at;
    }

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
    clientId,
  }: {
    invoice: any;
    agencyId: string;
    clientOrganizationId: string;
    clientId: string;
  }) {
    // Generar número de factura

    const invoiceData = {
      agency_id: agencyId,
      client_organization_id: clientOrganizationId,
      number: '',
      issue_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
      due_date: invoice.due_date 
        ? new Date(invoice.due_date * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: this.mapStripeInvoiceStatus(invoice.status),
      subtotal_amount: invoice.subtotal / 100,
      tax_amount: invoice.tax || 0,
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

    // Crear items de la factura si existen
    if (invoice.lines && invoice.lines.data.length > 0) {
      const invoiceItems = invoice.lines.data.map((line: any) => ({
        invoice_id: createdInvoice.id,
        description: line.description || 'Service item',
        quantity: line.quantity || 1,
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
      message: `Invoice created from Stripe: ${createdInvoice.number}`,
      type: 'billing',
      invoiceId: createdInvoice.id,
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
      provider_payment_id: invoice.payment_intent || invoice.id,
      processed_at: new Date().toISOString(),
    };

    const { error: paymentError } = await this.adminClient
      .from('invoice_payments')
      .insert(paymentData);

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
    }
  }

  private mapStripeInvoiceStatus(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'draft',
      'open': 'issued',
      'paid': 'paid',
      'uncollectible': 'overdue',
      'void': 'voided',
    };

    return statusMap[stripeStatus] || 'draft';
  }

  // private async generateInvoiceNumber(agencyId: string): Promise<string> {
  //   const currentDate = new Date();
  //   const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
    
  //   const { data: lastInvoice } = await this.adminClient
  //     .from('invoices')
  //     .select('number')
  //     .eq('agency_id', agencyId)
  //     .like('number', `INV-${dateStr}-%`)
  //     .order('created_at', { ascending: false })
  //     .limit(1)
  //     .single();

  //   let sequence = 1;
  //   if (lastInvoice?.number) {
  //     const lastSequence = parseInt(lastInvoice.number.split('-').pop() || '0');
  //     sequence = lastSequence + 1;
  //   }

  //   return `INV-${dateStr}-${sequence}`;
  // }

  private async createActivity({
    action,
    actor,
    message,
    type,
    clientId,
    invoiceId,
  }: {
    action: 'create' | 'update' | 'delete';
    actor: string;
    message: string;
    type: 'billing';
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
        value: message,
        invoice_id: invoiceId || null,
        user_id: clientId || 'system',
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

  // MANTENER TODA LA LÓGICA EXISTENTE DE TRELI
  private async handleTreliWebhook(body: string, treliSignature: string) {
    console.log('handleTreliWebhook', treliSignature);
    try {
      if (body.event_type === 'subscription_created') {
        const { data: billingServiceData, error: billingServiceError } =
          await this.adminClient
            .from('billing_services')
            .select('service_id')
            .eq('provider_id', body?.content?.items[0]?.id)
            .single();

        if (billingServiceError) {
          console.error('Error fetching billing service:', billingServiceError);
          throw billingServiceError;
        }

        const { data: serviceData, error: serviceError } =
          await this.adminClient
            .from('services')
            .select('propietary_organization_id')
            .eq('id', billingServiceData?.service_id)
            .single();

        if (serviceError) {
          console.error('Error fetching service:', serviceError);
          throw serviceError;
        }

        const {
          data: accountDataAgencyOwnerData,
          error: accountDataAgencyOwnerError,
        } = await this.adminClient
          .from('accounts')
          .select('id, organization_id')
          .eq('id', serviceData?.propietary_organization_id ?? '')
          .single();

        if (accountDataAgencyOwnerError) {
          console.error(
            'Error fetching organization:',
            accountDataAgencyOwnerError,
          );
          throw accountDataAgencyOwnerError;
        }
        const organizationId = accountDataAgencyOwnerData?.organization_id;
        if (organizationId) {
          // Search organization by accountId
          const fullName = `${body?.content?.billing?.first_name} ${body?.content?.billing?.last_name}`;
          const newClient = {
            email: body?.content?.billing?.email,
            slug: `${fullName}'s Organization`,
            name: fullName,
          };
          const createdBy = accountDataAgencyOwnerData?.id;

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
              agencyId: organizationId ?? '',
              adminActivated: true,
            });
          }

          // After assign a service to the client, we need to create the subscription
          // Search in the database, by checkout session id

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
            
            if (clientDataWithChecker) {
              clientId = clientDataWithChecker.id;
            } else {
              const { data: createClientDataWithChecker, error: clientError } =
                await this.adminClient
                  .from('clients')
                  .insert({
                    agency_id: organizationId ?? '',
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
            billingServiceData?.service_id ?? 0,
            clientId ?? '',
            createdBy ?? '',
            organizationId ?? '',
          );
        }
      }
    } catch (error) {
      console.error('Error handling treli webhook:', error);
      return;
    }
  }
}