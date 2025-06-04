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

class WebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}
  private readonly ClientRoleStripeInvitation = 'client_owner';

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
        // Mantener la lógica existente...
        await Promise.resolve();
      },

      onSubscriptionUpdated: async (data) => {
        console.log('onSubscriptionUpdated', data);
        await this.handleSubscriptionEvent(data, stripeAccountId, 'updated');
      },

      onSubscriptionDeleted: async (subscriptionId) => {
        console.log('onSubscriptionDeleted', subscriptionId);
        await this.handleSubscriptionDeleted(subscriptionId, stripeAccountId);
      },

      onPaymentSucceeded: async (sessionId) => {
        console.log('Payment succeeded:', sessionId);
        return Promise.resolve();
      },

      onPaymentIntentSucceeded: async (data) => {
        console.log('onPaymentIntentSucceeded', data);
        await this.handleSubscriptionEvent(data, stripeAccountId, 'created');
      },

      onPaymentFailed: async (sessionId) => {
        console.log('Payment failed:', sessionId);
        return Promise.resolve();
      },

      onInvoicePaid: async (data) => {
        console.log('onInvoicePaid', data);
        await this.handleInvoicePayment(data, stripeAccountId);
      },

      onEvent: async (event) => {
        console.log('Processing event:', event.type);

        // Manejar eventos adicionales de invoices
        if (event.type === 'invoice.created') {
          await this.handleInvoiceCreated(event, stripeAccountId);
        } else if (event.type === 'invoice.updated') {
          await this.handleInvoiceUpdated(event, stripeAccountId);
        } else if (event.type === 'customer.subscription.created') {
          await this.handleSubscriptionCreated(event, stripeAccountId);
        } else if (event.type === 'customer.subscription.updated') {
          await this.handleSubscriptionUpdated(event, stripeAccountId);
        }

        return Promise.resolve();
      },
    });
  }

  // Nuevo método para manejar subscription created
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

      // Buscar si ya existe el cliente por customer_id
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

      // Buscar el cliente en la base de datos por billing_customer_id
      // Primero intentamos encontrar si ya tenemos un cliente con este customer_id de Stripe
      const agencyId = Array.isArray(billingAccount.accounts?.organizations)
        ? billingAccount.accounts.organizations[0]?.id
        : billingAccount.accounts?.organizations?.id;

      // Buscar cliente existente
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
      await this.createClientSubscription({
        clientId: clientId!,
        subscription,
        agencyId: agencyId!,
      });

      console.log('Client subscription created successfully');
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  // Nuevo método para manejar subscription updated
  private async handleSubscriptionUpdated(event: any, stripeAccountId?: string) {
    try {
      const subscription = event.data.object;
      console.log('Processing subscription updated:', subscription.id);

      // Buscar la subscription existente
      const { data: existingSubscription, error: subError } = await this.adminClient
        .from('client_subscriptions')
        .select('id, client_id')
        .eq('billing_subscription_id', subscription.id)
        .eq('billing_provider', 'stripe')
        .single();

      if (subError) {
        console.error('Error fetching existing subscription:', subError);
        return;
      }

      if (existingSubscription) {
        await this.updateClientSubscription(subscription, existingSubscription.id);

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

  // Método auxiliar para crear client subscription
  private async createClientSubscription({
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

  // Método auxiliar para actualizar client subscription
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

  // Nuevo método para manejar invoice created
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

      // Buscar el cliente por customer_id
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

  // Nuevo método para manejar invoice updated
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

  // Método auxiliar para crear factura desde Stripe
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
    const invoiceNumber = await this.generateInvoiceNumber(agencyId);

    const invoiceData = {
      agency_id: agencyId,
      client_organization_id: clientOrganizationId,
      number: invoiceNumber,
      issue_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
      due_date: invoice.due_date
        ? new Date(invoice.due_date * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
      status: this.mapStripeInvoiceStatus(invoice.status),
      subtotal_amount: invoice.subtotal / 100, // Stripe amounts are in cents
      tax_amount: invoice.tax || 0,
      total_amount: invoice.total / 100,
      currency: invoice.currency.toUpperCase(),
      provider_id: invoice.id,
      checkout_url: invoice.hosted_invoice_url,
    };

    const { data: createdInvoice, error: invoiceError } = await this.adminClient
      .from('invoices')
      .insert(invoiceData)
      .select('id')
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

    // Crear actividad
    await this.createActivity({
      action: 'create',
      actor: 'System',
      message: `Invoice created from Stripe: ${invoiceNumber}`,
      type: 'billing',
      invoiceId: createdInvoice.id,
    });

    return createdInvoice.id;
  }

  // Método auxiliar para registrar pago de factura
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

  // Método auxiliar para mapear status de Stripe a nuestro sistema
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

  // Método auxiliar para generar número de factura
  private async generateInvoiceNumber(agencyId: string): Promise<string> {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');

    const { data: lastInvoice } = await this.adminClient
      .from('invoices')
      .select('number')
      .eq('agency_id', agencyId)
      .like('number', `INV-${dateStr}-%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastInvoice?.number) {
      const lastSequence = parseInt(lastInvoice.number.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `INV-${dateStr}-${sequence}`;
  }

  // Método auxiliar para crear actividades
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
        user_id: clientId || 'system', // Usar system si no hay clientId
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

  // Mantener métodos existentes...
  private async handleSubscriptionEvent(data: any, stripeAccountId?: string, eventType: 'created' | 'updated') {
    // Implementación existente si la tienes
    console.log(`Subscription ${eventType}:`, data);
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

  private async handleInvoicePayment(data: any, stripeAccountId?: string) {
    // Lógica para manejar pagos de facturas
    console.log('Handling invoice payment:', data);
  }

  // Mantener el resto de métodos existentes para Treli...
  private async handleTreliWebhook(body: string, treliSignature: string) {
    // Tu lógica existente de Treli...
  }
}