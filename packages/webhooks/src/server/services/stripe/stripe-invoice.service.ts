import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { Activity } from '@kit/supabase/types';
import { BaseWebhookService } from '../shared/base-webhook.service';
import { RetryOperationService } from '@kit/shared/retry-operation-service';

export class StripeInvoiceService extends BaseWebhookService {
  constructor(adminClient: SupabaseClient<Database>) {
    super(adminClient);
  }

  async handleInvoiceCreated(event: any, stripeAccountId?: string) {
    try {
      if (!stripeAccountId) {
        console.log('No stripe account ID provided');
        return;
      }

      const invoice = event.data.object;

      const retryOperation = new RetryOperationService(
        async () => {
          // Buscar la agencia por el Stripe account ID
          const { data: billingAccount, error: billingError } = await this.adminClient
            .from('billing_accounts')
            .select('account_id, accounts(id, organizations(id))')
            .eq('provider_id', stripeAccountId)
            .single();

          if (billingError || !billingAccount) {
            throw new Error(`Failed to find billing account: ${billingError?.message}`);
          }

          const agencyId = Array.isArray(billingAccount.accounts?.organizations) 
            ? billingAccount.accounts.organizations[0]?.id 
            : billingAccount.accounts?.organizations?.id;

          if (!agencyId) {
            throw new Error('Agency ID not found');
          }

          // Buscar el cliente por la subscription
          const { data: clientSubscription, error: clientSubError } = await this.adminClient
            .from('client_subscriptions')
            .select('clients(organization_client_id, user_client_id)')
            .eq('billing_customer_id', invoice.customer)
            .eq('billing_provider', 'stripe')
            .single();

          if (clientSubError) {
            throw new Error(`Failed to find client subscription: ${clientSubError.message}`);
          }

          // Buscar el servicio de billing
          const { data: billingServices, error: serviceError } = await this.adminClient
            .from('billing_services')
            .select('service_id')
            .eq('billing_product_id', invoice.lines.data[0]?.price?.product || '')
            .single();

          if (serviceError) {
            console.warn('Service not found for billing product:', invoice.lines.data[0]?.price?.product);
          }

          const clientOrganizationId = Array.isArray(clientSubscription.clients?.organization_client_id)
            ? clientSubscription.clients.organization_client_id[0]
            : clientSubscription.clients?.organization_client_id;
          const userClientId = clientSubscription.clients?.user_client_id ?? '';
          const serviceId = billingServices?.service_id || 0;

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

  async handleInvoiceUpdated(event: any) {
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
          updateData.paid_at = new Date().toISOString();
        }

        const { error: updateError } = await this.adminClient
          .from('invoices')
          .update(updateData)
          .eq('id', existingInvoice.id);

        if (updateError) {
          console.error('Error updating invoice:', updateError);
          return;
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
        await this.activityService.createActivity({
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

  async handleInvoicePayment(data: any) {
    console.log('Handling invoice payment:', data);
    const retryOperation = new RetryOperationService(
      async () => {
        // get invoice id from invoices 
        const { data: invoiceData, error: invoiceError } = await this.adminClient
          .from('invoices')
          .select('id')
          .eq('provider_id', data.id)
          .single();

        if (invoiceError) {
          throw new Error(`Failed to get Invoice ${invoiceError.message}`);
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
    );
    await retryOperation.execute();
  }

  async createInvoiceFromStripe({
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
    userClientId?: string;
  }) {
    console.log('Creating invoice from Stripe:', invoice.id);
    const mappedStatus = this.mapStripeInvoiceStatus(invoice.status) ?? 'draft';
    const invoiceData = {
      agency_id: agencyId,
      client_organization_id: clientOrganizationId,
      number: '',
      issue_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
      due_date: (invoice.due_date 
        ? new Date(invoice.due_date * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
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
        description: line.description || 'Service',
        quantity: line.quantity || 1,
        unit_price: (line.amount || 0) / 100,
        total_price: (line.amount || 0) / 100,
      }));

      const { error: itemsError } = await this.adminClient
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError);
      }
    }

    // Create activity for invoice creation
    await this.activityService.createActivity({
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
      console.error('Error recording invoice payment:', paymentError);
      throw new Error(`Failed to record invoice payment: ${paymentError.message}`);
    }
  }
}