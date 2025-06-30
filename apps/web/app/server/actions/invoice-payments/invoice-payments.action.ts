'use server';

import { createInvoicePaymentAction } from './invoice-payments';
import { InvoicePayment } from '~/lib/invoice-payment.types';

function getInvoicePaymentAction() {
  return createInvoicePaymentAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createInvoicePayment(payload: InvoicePayment.Request.Create) {
  return await getInvoicePaymentAction().create(payload);
}

export async function getInvoicePaymentsByInvoiceId(invoiceId: string) {
  return await getInvoicePaymentAction().getByInvoiceId(invoiceId);
}

export async function getInvoicePayment(paymentId: string) {
  return await getInvoicePaymentAction().get(paymentId);
}

export async function updateInvoicePayment(payload: InvoicePayment.Request.Update) {
  return await getInvoicePaymentAction().update(payload);
}

export async function deleteInvoicePayment(paymentId: string) {
  return await getInvoicePaymentAction().delete(paymentId);
}

export async function processManualPayment(
  invoiceId: string,
  paymentData: {
    amount: number;
    paymentMethod: string;
    notes?: string;
    referenceNumber?: string;
    sessionId?: string;
  }
) {
  return await getInvoicePaymentAction().processManualPayment(invoiceId, paymentData);
}