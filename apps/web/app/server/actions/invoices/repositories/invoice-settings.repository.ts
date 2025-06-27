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

  // * UTILITY METHODS
  async getOrganizationBillingInfo(organizationId: string): Promise<InvoiceSettings.Insert | null> {
    const client = this.client;
    
    try {
      // Get organization basic data
      const { data: org, error: orgError } = await client
        .from('organizations')
        .select('id, name')
        .eq('id', organizationId)
        .single();

      if (orgError ?? !org) {
        console.warn(`Organization ${organizationId} not found:`, orgError);
        return null;
      }

      // Get organization billing settings
      const { data: settings, error: settingsError } = await client
        .from('organization_settings')
        .select('key, value')
        .eq('organization_id', organizationId)
        .in('key', ['billing_details', 'payment_details']);

      if (settingsError) {
        console.warn(`Error fetching settings for organization ${organizationId}:`, settingsError);
      }

      // Parse billing details from settings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let billingData: any = {};
      if (settings) {
        const billingDetails = settings.find(s => s.key === 'billing_details');
        const paymentDetails = settings.find(s => s.key === 'payment_details');
        
        if (billingDetails?.value) {
          try {
            billingData = JSON.parse(billingDetails.value);
          } catch (e) {
            console.warn('Error parsing billing_details JSON:', e);
          }
        }
        
        if (paymentDetails?.value && !billingData.address_1) {
          try {
            const paymentData = JSON.parse(paymentDetails.value);
            billingData = { ...billingData, ...paymentData };
          } catch (e) {
            console.warn('Error parsing payment_details JSON:', e);
          }
        }
      }

      // Create invoice settings with available data
      const invoiceSettings: InvoiceSettings.Insert = {
        invoice_id: '', // Will be set when used
        organization_id: organizationId,
        name: billingData.name || org.name || 'Organization Name',
        address_1: billingData.address_1 || billingData.address || 'Address not provided',
        address_2: billingData.address_2 || null,
        country: billingData.country || 'United States',
        postal_code: billingData.postal_code || billingData.zip || 'N/A',
        city: billingData.city || 'City not provided',
        state: billingData.state || billingData.region || null,
        tax_id_type: billingData.tax_id_type || (billingData.tax_id ? 'EIN' : null),
        tax_id_number: billingData.tax_id_number || billingData.tax_id || null,
      };

      return invoiceSettings;
    } catch (error) {
      console.error(`Error getting billing info for organization ${organizationId}:`, error);
      return null;
    }
  }

  async createInvoiceSettingsFromOrganizations(
    invoiceId: string,
    agencyId: string,
    clientOrganizationId: string
  ): Promise<InvoiceSettings.Type[]> {
    const results: InvoiceSettings.Type[] = [];

    // Get agency billing info
    const agencyInfo = await this.getOrganizationBillingInfo(agencyId);
    if (agencyInfo) {
      try {
        const agencySettings = await this.create({
          ...agencyInfo,
          invoice_id: invoiceId,
        });
        results.push(agencySettings);
      } catch (error) {
        console.error('Error creating agency settings:', error);
      }
    }

    // Get client billing info  
    const clientInfo = await this.getOrganizationBillingInfo(clientOrganizationId);
    if (clientInfo) {
      try {
        const clientSettings = await this.create({
          ...clientInfo,
          invoice_id: invoiceId,
        });
        results.push(clientSettings);
      } catch (error) {
        console.error('Error creating client settings:', error);
      }
    }

    return results;
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
