import { z } from 'zod';

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  dateOfIssue: z.date(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  lineItems: z.array(z.object({
    serviceId: z.number().min(1, 'Service is required'),
    description: z.string().min(1, 'Description is required'),
    rate: z.number().min(0, 'Rate must be positive'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>; 