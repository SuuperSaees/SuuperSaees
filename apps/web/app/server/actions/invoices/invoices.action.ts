'use server';

import { createInvoiceAction } from './invoices';
import { Invoice } from '~/lib/invoice.types';
import { PaginationConfig } from '../query.config';

function getInvoiceAction() {
  return createInvoiceAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createInvoice(payload: Invoice.Request.Create) {
  return await getInvoiceAction().create(payload);
}

export async function getInvoices(
  config?: PaginationConfig
) {
  return await getInvoiceAction().list(config);
}

export async function getInvoice(invoiceId: string) {
  return await getInvoiceAction().get(invoiceId);
}

export async function deleteInvoice(invoiceId: string) {
  return await getInvoiceAction().delete(invoiceId);
}

export async function updateInvoice(payload: Invoice.Request.Update) {
  return await getInvoiceAction().update(payload);
}