import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { InvoicePayment } from '~/lib/invoice-payment.types';

export class InvoicePaymentRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async create(payload: InvoicePayment.Insert): Promise<InvoicePayment.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoice_payments')
      .insert({
        invoice_id: payload.invoice_id,
        payment_method: payload.payment_method,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status ?? 'pending',
        payment_date: payload.payment_date ?? new Date().toISOString(),
        reference_number: payload.reference_number,
        notes: payload.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating invoice payment: ${error.message}`);
    }

    return data as InvoicePayment.Type;
  }

  // * GET REPOSITORIES
  async getByInvoiceId(invoiceId: string): Promise<InvoicePayment.Response[]> {
    const client = this.client;
    const { data, error } = await client
      .from('invoice_payments')
      .select(`
        *,
        invoice:invoices!invoice_id(
          id,
          number,
          total_amount,
          currency
        )
      `)
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching payments for invoice ${invoiceId}: ${error.message}`);
    }

    return data as InvoicePayment.Response[];
  }

  async get(paymentId: string): Promise<InvoicePayment.Response> {
    const client = this.client;
    const { data, error } = await client
      .from('invoice_payments')
      .select(`
        *,
        invoice:invoices!invoice_id(
          id,
          number,
          total_amount,
          currency
        )
      `)
      .eq('id', paymentId)
      .single();

    if (error) {
      throw new Error(`Error fetching payment ${paymentId}: ${error.message}`);
    }

    return data as InvoicePayment.Response;
  }

  // * UPDATE REPOSITORIES
  async update(payload: InvoicePayment.Update): Promise<InvoicePayment.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoice_payments')
      .update(payload)
      .eq('id', payload.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating payment ${payload.id}: ${error.message}`);
    }

    return data as InvoicePayment.Type;
  }

  // * DELETE REPOSITORIES
  async delete(paymentId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('invoice_payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      throw new Error(`Error deleting payment ${paymentId}: ${error.message}`);
    }
  }
}