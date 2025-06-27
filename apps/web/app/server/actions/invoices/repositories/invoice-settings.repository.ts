import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { InvoiceSettings } from '~/lib/invoice.types';

export class InvoiceSettingsRepository {
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
  async create(payload: InvoiceSettings.Insert): Promise<InvoiceSettings.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoice_settings')
      .insert({
        invoice_id: payload.invoice_id,
        organization_id: payload.organization_id,
        name: payload.name,
        address_1: payload.address_1,
        address_2: payload.address_2,
        country: payload.country,
        postal_code: payload.postal_code,
        city: payload.city,
        state: payload.state,
        tax_id_type: payload.tax_id_type,
        tax_id_number: payload.tax_id_number,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating invoice settings: ${error.message}`);
    }

    return data as InvoiceSettings.Type;
  }

  async createMany(payloads: InvoiceSettings.Insert[]): Promise<InvoiceSettings.Type[]> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoice_settings')
      .insert(payloads)
      .select();

    if (error) {
      throw new Error(`Error creating invoice settings: ${error.message}`);
    }

    return data as InvoiceSettings.Type[];
  }

  // * GET REPOSITORIES
  async getByInvoiceId(invoiceId: string): Promise<InvoiceSettings.Response[]> {
    const client = this.client;
    
    const { data, error } = await client
      .from('invoice_settings')
      .select('*')
      .eq('invoice_id', invoiceId)
      .is('deleted_on', null)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching invoice settings for invoice ${invoiceId}: ${error.message}`);
    }

    return (data ?? []) as InvoiceSettings.Response[];
  }

  async get(settingsId: string): Promise<InvoiceSettings.Response> {
    const client = this.client;
    
    const { data, error } = await client
      .from('invoice_settings')
      .select('*')
      .eq('id', settingsId)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching invoice settings ${settingsId}: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Invoice settings ${settingsId} not found`);
    }

    return data as InvoiceSettings.Response;
  }

  // * UPDATE REPOSITORIES
  async update(payload: InvoiceSettings.Update): Promise<InvoiceSettings.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoice_settings')
      .update(payload)
      .eq('id', payload.id ?? '')
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating invoice settings ${payload.id}: ${error.message}`);
    }

    return data as InvoiceSettings.Type;
  }

  async updateByInvoiceAndOrganization(
    invoiceId: string,
    organizationId: string,
    payload: Omit<InvoiceSettings.Update, 'id' | 'invoice_id' | 'organization_id'>
  ): Promise<InvoiceSettings.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoice_settings')
      .update(payload)
      .eq('invoice_id', invoiceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating invoice settings for invoice ${invoiceId} and organization ${organizationId}: ${error.message}`);
    }

    return data as InvoiceSettings.Type;
  }

  // * DELETE REPOSITORIES
  async delete(settingsId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('invoice_settings')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', settingsId);

    if (error) {
      throw new Error(`Error deleting invoice settings ${settingsId}: ${error.message}`);
    }
  }

  async deleteByInvoiceId(invoiceId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('invoice_settings')
      .update({ deleted_on: new Date().toISOString() })
      .eq('invoice_id', invoiceId);

    if (error) {
      throw new Error(`Error deleting invoice settings for invoice ${invoiceId}: ${error.message}`);
    }
  }
}
