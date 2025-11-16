import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { InvoiceSettingsRepository } from '../../../../../../apps/web/app/server/actions/invoices/repositories/invoice-settings.repository';
import { InvoiceSettings } from '../../../../../../apps/web/lib/invoice.types';

/**
 * Session data interface for webhook helper
 */
interface SessionData {
  client_name?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  client_city?: string | null;
  client_country?: string | null;
  client_state?: string | null;
  client_postal_code?: string | null;
  metadata?: unknown;
}

/**
 * Metadata interface for session data
 */
interface SessionMetadata {
  enterprise_name?: string;
  tax_code?: string;
  buying_for_organization?: boolean;
}

/**
 * Helper class for handling invoice_settings in webhook contexts
 */
export class InvoiceSettingsWebhookHelper {
  private adminClient: SupabaseClient<Database>;
  private invoiceSettingsRepository: InvoiceSettingsRepository;

  constructor(adminClient: SupabaseClient<Database>) {
    this.adminClient = adminClient;
    this.invoiceSettingsRepository = new InvoiceSettingsRepository(adminClient, adminClient);
  }

  /**
   * Creates invoice_settings from organization data and session data for webhooks
   * @param invoiceId - The invoice ID
   * @param agencyId - Agency organization ID  
   * @param clientOrganizationId - Client organization ID
   * @param session - Session data for extracting billing info
   * @returns Created invoice settings
   */
  async createInvoiceSettingsForWebhook(
    invoiceId: string,
    agencyId: string,
    clientOrganizationId: string,
    session?: SessionData
  ): Promise<InvoiceSettings.Type[]> {
    const results: InvoiceSettings.Type[] = [];

    // 1. Create agency settings from organization data
    const agencyInfo = await this.invoiceSettingsRepository.getOrganizationBillingInfo(agencyId);
    if (agencyInfo) {
      try {
        const agencySettings = await this.invoiceSettingsRepository.create({
          ...agencyInfo,
          invoice_id: invoiceId,
        });
        results.push(agencySettings);
      } catch (error) {
        console.error('Error creating agency invoice settings:', error);
      }
    }

    // 2. Create client settings - try organization data first, then session data
    let clientInfo = await this.invoiceSettingsRepository.getOrganizationBillingInfo(clientOrganizationId);
    
    // If no organization billing info and we have session data, create from session
    if (!clientInfo && session) {
      clientInfo = this.createSettingsFromSession(clientOrganizationId, session);
    }

    if (clientInfo) {
      try {
        const clientSettings = await this.invoiceSettingsRepository.create({
          ...clientInfo,
          invoice_id: invoiceId,
        });
        results.push(clientSettings);

        // If this is a new client organization, also update organization_settings for future use
        await this.updateOrganizationSettingsForNewClient(clientOrganizationId, session);
      } catch (error) {
        console.error('Error creating client invoice settings:', error);
      }
    }

    return results;
  }

  /**
   * Creates invoice settings from session data when organization data is not available
   */
  private createSettingsFromSession(
    organizationId: string,
    session: SessionData
  ) {
    // Parse metadata for additional billing info
    let metadata = {};
    if (session.metadata) {
      try {
        metadata = typeof session.metadata === 'string' 
          ? JSON.parse(session.metadata) 
          : session.metadata;
      } catch (error) {
        console.warn('Error parsing session metadata:', error);
      }
    }

    const metadataTyped = metadata as SessionMetadata;

    return {
      invoice_id: '', // Will be set when used
      organization_id: organizationId,
      name: metadataTyped.enterprise_name ?? session.client_name ?? 'Client Organization',
      address_1: session.client_address ?? 'Address not provided',
      address_2: null,
      country: session.client_country ?? 'United States',
      postal_code: session.client_postal_code ?? 'N/A',
      city: session.client_city ?? 'City not provided',
      state: session.client_state ?? null,
      tax_id_type: metadataTyped.tax_code ? 'EIN' : null,
      tax_id_number: metadataTyped.tax_code ?? null,
    };
  }

  /**
   * Updates organization_settings for a new client organization with billing data from session
   * This ensures future invoices will have proper billing information
   */
  private async updateOrganizationSettingsForNewClient(
    clientOrganizationId: string,
    session?: SessionData
  ) {
    if (!session) return;

    try {
      // Parse metadata for additional billing info
      let metadata = {};
      if (session.metadata) {
        try {
          metadata = typeof session.metadata === 'string' 
            ? JSON.parse(session.metadata) 
            : session.metadata;
        } catch (error) {
          console.warn('Error parsing session metadata:', error);
        }
      }

      const metadataTyped = metadata as SessionMetadata;

      // Build billing_details JSON structure
      const billingDetails = {
        name: metadataTyped.enterprise_name ?? session.client_name ?? 'Client Organization',
        address_1: session.client_address ?? 'Address not provided',
        address_2: null,
        country: session.client_country ?? 'United States',
        postal_code: session.client_postal_code ?? 'N/A',
        city: session.client_city ?? 'City not provided',
        state: session.client_state ?? null,
        tax_id_type: metadataTyped.tax_code ? 'EIN' : null,
        tax_id_number: metadataTyped.tax_code ?? null,
      };

      // Check if billing_details already exists
      const { data: existingSettings, error: checkError } = await this.adminClient
        .from('organization_settings')
        .select('id')
        .eq('organization_id', clientOrganizationId)
        .eq('key', 'billing_details')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing billing settings:', checkError);
        return;
      }

      // Only create billing_details if it doesn't exist
      if (!existingSettings) {
        const { error: insertError } = await this.adminClient
          .from('organization_settings')
          .insert({
            organization_id: clientOrganizationId,
            key: 'billing_details',
            value: JSON.stringify(billingDetails),
          });

        if (insertError) {
          console.error('Error creating organization billing settings:', insertError);
        } else {
          console.log(`Created organization billing settings for client: ${clientOrganizationId}`);
        }
      }
    } catch (error) {
      console.error('Error updating organization settings for new client:', error);
    }
  }
}
