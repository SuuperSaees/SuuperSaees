import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
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
      total_price: (item.quantity ?? 0) * item.unit_price,
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

  async deleteByIds(itemIds: string[]): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('invoice_items')
      .delete()
      .in('id', itemIds);

    if (error) {
      throw new Error(`Error deleting invoice items by IDs: ${error.message}`);
    }
  }

  async upsert(
    invoiceId: string,
    items: (InvoiceItem.Insert & { id?: string })[],
  ): Promise<InvoiceItem.Type[]> {
    const client = this.adminClient ?? this.client;

    // Remove any duplicate items by id, keeping the last occurrence
    const uniqueItems = [...new Map(
      items
        .filter(item => item.id) // Only keep items with IDs for uniqueness
        .map(item => [item.id, item])
    ).values()];
    
    // Items sin ID se agregan directamente
    const itemsWithoutId = items.filter(item => !item.id);
    const allUniqueItems = [...uniqueItems, ...itemsWithoutId];

    // Fetch existing items from database
    const { data: existingItems, error: fetchError } = await client
      .from('invoice_items')
      .select('id, description, quantity, unit_price, total_price')
      .eq('invoice_id', invoiceId);

    if (fetchError) {
      throw new Error(`Error fetching existing invoice items: ${fetchError.message}`);
    }

    // Extract existing IDs and create a map for easy lookup
    const existingIds = existingItems?.map(item => item.id) || [];
    const existingItemsMap = new Map(
      existingItems?.map(item => [item.id, item]) || []
    );

    // Determine which items to add (no tienen ID) and which to update (tienen ID y existen diferencias)
    const itemsToAdd = allUniqueItems.filter(item => !item.id);
    const itemsToUpdate = allUniqueItems.filter(item => {
      if (!item.id) return false;
      const existing = existingItemsMap.get(item.id);
      return existing && (
        existing.description !== item.description ||
        existing.quantity !== item.quantity ||
        existing.unit_price !== item.unit_price
      );
    });

    // Delete items that are not in the new list (existen en DB pero no vienen del front)
    const itemIdsFromFront = allUniqueItems
      .filter(item => item.id)
      .map(item => item.id);
    
    const itemsToDelete = existingIds.filter(
      id => !itemIdsFromFront.includes(id)
    );

    // Delete items that are not in the new list
    if (itemsToDelete.length > 0) {
      const { error: deleteError } = await client
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)
        .in('id', itemsToDelete);

      if (deleteError) {
        throw new Error(`Error removing invoice items: ${deleteError.message}`);
      }
    }

    // Prepare data for items that need to be added or updated
    const upsertData = [...itemsToAdd, ...itemsToUpdate].map(item => ({
      ...(item.id && { id: item.id }), // Solo incluir ID si existe
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: (item.quantity ?? 0) * item.unit_price,
      service_id: item.service_id,
    }));


    if (upsertData.length > 0) {
      const { error: upsertError } = await client
        .from('invoice_items')
        .upsert(upsertData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (upsertError) {
        throw new Error(`Error upserting invoice items: ${upsertError.message}`);
      }

    }

    // Fetch all current items for the invoice to return complete list
    const { data: allCurrentItems, error: finalFetchError } = await client
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (finalFetchError) {
      throw new Error(`Error fetching final invoice items: ${finalFetchError.message}`);
    }

    revalidatePath(`/invoices/${invoiceId}`);
    return allCurrentItems as InvoiceItem.Type[];
  }

  // Legacy method for compatibility
  async updateMany(invoiceId: string, items: (InvoiceItem.Insert & { id?: string })[]): Promise<InvoiceItem.Type[]> {
    return await this.upsert(invoiceId, items);
  }
}