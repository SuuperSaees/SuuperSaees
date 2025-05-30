import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { InvoiceItem } from '~/lib/invoice.types';

export class InvoiceItemsRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  async createMany(invoiceId: string, items: InvoiceItem.Insert[]): Promise<InvoiceItem.Type[]> {
    const client = this.adminClient ?? this.client;
    
    const itemsToInsert = items.map(item => ({
      ...item,
      invoice_id: invoiceId,
      total_price: item.quantity * item.unit_price,
    }));

    const { data, error } = await client
      .from('invoice_items')
      .insert(itemsToInsert)
      .select();

    if (error) {
      throw new Error(`Error creating invoice items: ${error.message}`);
    }

    return data as InvoiceItem.Type[];
  }

  async deleteByInvoiceId(invoiceId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);

    if (error) {
      throw new Error(`Error deleting invoice items: ${error.message}`);
    }
  }

  async updateMany(invoiceId: string, items: InvoiceItem.Insert[]): Promise<InvoiceItem.Type[]> {
    // Delete existing items and create new ones
    await this.deleteByInvoiceId(invoiceId);
    return await this.createMany(invoiceId, items);
  }
} 