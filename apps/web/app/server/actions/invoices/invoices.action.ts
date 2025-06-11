'use server';

import { createInvoiceAction } from './invoices';
import { Invoice, InvoiceItem } from '~/lib/invoice.types';

interface PaginationConfig {
  pagination?: {
    cursor?: string | number;
    endCursor?: string | number;
    page?: number;
    offset?: number;
    limit?: number;
  };
  search?: {
    term?: string;
    fields?: string[];
  };
  filters?: {
    status?: string[];
    customer_id?: string[];
    organization_id?: string[];
    date_from?: string;
    date_to?: string;
  };
}

function getInvoiceAction() {
  return createInvoiceAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createInvoice(payload: Invoice.InsertWithRelations) {
  return await getInvoiceAction().create(payload);
}

export async function getInvoices(
  organizationId: string, 
  config?: PaginationConfig
) {
  return await getInvoiceAction().list(organizationId, config);
}

export async function getInvoice(invoiceId: string) {
  return await getInvoiceAction().get(invoiceId);
}

export async function deleteInvoice(invoiceId: string) {
  return await getInvoiceAction().delete(invoiceId);
}

export async function updateInvoice(payload: Invoice.Update & {invoice_items?: InvoiceItem.Insert[]}) {
  return await getInvoiceAction().update(payload);
}