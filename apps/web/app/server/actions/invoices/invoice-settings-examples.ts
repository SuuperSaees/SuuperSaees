/**
 * Examples of using the new invoice_settings functionality
 * 
 * This file shows how to use the updated invoice system
 * that now supports invoice_settings for both agency and client organizations.
 */

import { createInvoice, updateInvoice, getInvoice } from './invoices.action';
import { Invoice, InvoiceSettings } from '~/lib/invoice.types';

// Example 1: Creating an invoice with AUTOMATIC invoice_settings (NEW BEHAVIOR)
async function createInvoiceWithAutomaticSettings() {
  try {
    // Just create the invoice - settings will be created automatically from organization data
    const invoicePayload: Invoice.Request.Create = {
      client_organization_id: 'client_org_id',
      agency_id: 'agency_org_id',
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'draft',
      subtotal_amount: 1000,
      tax_amount: 100,
      total_amount: 1100,
      currency: 'USD',
      notes: 'Monthly consulting services',
      invoice_items: [
        {
          invoice_id: '', // Will be set automatically
          description: 'Web Development Services',
          quantity: 40,
          unit_price: 25,
          total_price: 1000,
        }
      ],
      // NO invoice_settings provided - they will be created automatically!
    };

    const result = await createInvoice(invoicePayload);
    console.log('Invoice created with automatic settings:', result);
    
    // Get the invoice to see the auto-generated settings
    const fullInvoice = await getInvoice(result.id);
    console.log('Auto-generated settings:', fullInvoice.invoice_settings);
    
    return result;
  } catch (error) {
    console.error('Error creating invoice with automatic settings:', error);
    throw error;
  }
}

// Example 2: Creating an invoice with MANUAL invoice_settings (OVERRIDE BEHAVIOR)
async function createInvoiceWithManualSettings() {
  try {
    const agencySettings: InvoiceSettings.Insert = {
      invoice_id: '', // Will be set automatically
      organization_id: 'agency_org_id',
      name: 'My Digital Agency LLC',
      address_1: '123 Business St',
      address_2: 'Suite 100',
      country: 'United States',
      postal_code: '12345',
      city: 'New York',
      state: 'NY',
      tax_id_type: 'EIN',
      tax_id_number: '12-3456789',
    };

    const clientSettings: InvoiceSettings.Insert = {
      invoice_id: '', // Will be set automatically
      organization_id: 'client_org_id',
      name: 'Client Company Inc',
      address_1: '456 Client Ave',
      address_2: null,
      country: 'United States',
      postal_code: '67890',
      city: 'Los Angeles',
      state: 'CA',
      tax_id_type: 'EIN',
      tax_id_number: '98-7654321',
    };

    const invoicePayload: Invoice.Request.Create = {
      client_organization_id: 'client_org_id',
      agency_id: 'agency_org_id',
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'draft',
      subtotal_amount: 1000,
      tax_amount: 100,
      total_amount: 1100,
      currency: 'USD',
      notes: 'Monthly consulting services with custom billing details',
      invoice_items: [
        {
          invoice_id: '', // Will be set automatically
          description: 'Web Development Services',
          quantity: 40,
          unit_price: 25,
          total_price: 1000,
        }
      ],
      invoice_settings: [agencySettings, clientSettings], // Manual override
    };

    const result = await createInvoice(invoicePayload);
    console.log('Invoice created with manual settings:', result);
    return result;
  } catch (error) {
    console.error('Error creating invoice with manual settings:', error);
    throw error;
  }
}

// Example 2: Updating an invoice with settings changes
async function updateInvoiceWithNewSettings(invoiceId: string) {
  try {
    // First get the current invoice to see existing settings
    const currentInvoice = await getInvoice(invoiceId);
    console.log('Current invoice settings:', currentInvoice.invoice_settings);

    // Update the invoice and its settings
    const updatePayload: Invoice.Request.Update = {
      id: invoiceId,
      status: 'issued',
      notes: 'Updated: Ready for payment',
      invoice_settings: [
        {
          // Update agency settings by organization_id (invoice_id not needed for updates)
          invoice_id: invoiceId, // Required by type but handled internally
          organization_id: 'agency_org_id',
          name: 'My Digital Agency LLC - Updated',
          address_1: '789 New Business Blvd',
          address_2: 'Floor 5',
          country: 'United States',
          postal_code: '11111',
          city: 'Miami',
          state: 'FL',
          tax_id_type: 'EIN',
          tax_id_number: '12-3456789',
        },
        {
          // Update client settings by organization_id
          invoice_id: invoiceId, // Required by type but handled internally
          organization_id: 'client_org_id',
          name: 'Client Company Inc - Headquarters',
          address_1: '999 Client Plaza',
          address_2: 'Building A',
          country: 'United States',
          postal_code: '22222',
          city: 'Seattle',
          state: 'WA',
          tax_id_type: 'EIN',
          tax_id_number: '98-7654321',
        }
      ]
    };

    const result = await updateInvoice(updatePayload);
    console.log('Invoice updated with new settings:', result);
    return result;
  } catch (error) {
    console.error('Error updating invoice with settings:', error);
    throw error;
  }
}

// Example 3: Creating invoice without settings (existing functionality preserved)
async function createSimpleInvoice() {
  try {
    const invoicePayload: Invoice.Request.Create = {
      client_organization_id: 'client_org_id',
      agency_id: 'agency_org_id',
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      subtotal_amount: 500,
      tax_amount: 50,
      total_amount: 550,
      currency: 'USD',
      notes: 'Simple invoice without settings',
      invoice_items: [
        {
          invoice_id: '', // Will be set automatically
          description: 'Consultation Service',
          quantity: 10,
          unit_price: 50,
          total_price: 500,
        }
      ],
      // No invoice_settings provided - this is fine!
    };

    const result = await createInvoice(invoicePayload);
    console.log('Simple invoice created:', result);
    return result;
  } catch (error) {
    console.error('Error creating simple invoice:', error);
    throw error;
  }
}

// Example 4: Getting invoice with settings
async function getInvoiceWithSettings(invoiceId: string) {
  try {
    const invoice = await getInvoice(invoiceId);
    
    console.log('Invoice details:', {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      total_amount: invoice.total_amount,
      client: invoice.client?.name,
      agency: invoice.agency?.name,
      items_count: invoice.invoice_items?.length ?? 0,
      settings_count: invoice.invoice_settings?.length ?? 0,
    });

    // Process settings by organization
    const agencySettings = invoice.invoice_settings?.find(
      setting => setting.organization_id === invoice.agency_id
    );
    
    const clientSettings = invoice.invoice_settings?.find(
      setting => setting.organization_id === invoice.client_organization_id
    );

    console.log('Agency billing details:', agencySettings);
    console.log('Client billing details:', clientSettings);

    return {
      invoice,
      agencySettings,
      clientSettings,
    };
  } catch (error) {
    console.error('Error getting invoice with settings:', error);
    throw error;
  }
}

// Example 5: Helper function to create settings from organization data
function createSettingsFromOrganization(
  organizationId: string,
  organizationData: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    tax_id?: string;
  }
): InvoiceSettings.Insert {
  return {
    invoice_id: '', // Will be set by repository
    organization_id: organizationId,
    name: organizationData.name,
    address_1: organizationData.address ?? '',
    address_2: null,
    country: organizationData.country ?? 'United States',
    postal_code: organizationData.postal_code ?? '',
    city: organizationData.city ?? '',
    state: organizationData.state ?? null,
    tax_id_type: organizationData.tax_id ? 'EIN' : null,
    tax_id_number: organizationData.tax_id ?? null,
  };
}

export default {
  createInvoiceWithAutomaticSettings,
  createInvoiceWithManualSettings,
  updateInvoiceWithNewSettings,
  createSimpleInvoice,
  getInvoiceWithSettings,
  createSettingsFromOrganization,
};

export {
  createInvoiceWithAutomaticSettings,
  createInvoiceWithManualSettings,
  updateInvoiceWithNewSettings,
  createSimpleInvoice,
  getInvoiceWithSettings,
  createSettingsFromOrganization,
};
