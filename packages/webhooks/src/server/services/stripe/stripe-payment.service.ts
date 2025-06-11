import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { Activity } from '../../../../../../apps/web/lib/activity.types';
import { BaseWebhookService } from '../shared/base-webhook.service';

export class StripePaymentService extends BaseWebhookService {
  constructor(adminClient: SupabaseClient<Database>) {
    super(adminClient);
  }

  // Method to create a local invoice for one-time payments
  async handleOneTimePayment(data: any, agencyId: string, clientOrganizationId: string, userClientId: string, service?: { id?: number, name?: string }) {
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

  // Method to create local invoice for one-time payments
  async createLocalInvoiceForOneTimePayment({
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
    service?: { name?: string; id?: number; };
  }) {
    console.log('Creating local invoice for one-time payment:', paymentIntentId);

    const dueDate = new Date().toISOString();

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

    // Create invoice item
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

  // Method to record local payment for one-time payments
  async recordLocalPaymentForOneTimePayment({
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
}