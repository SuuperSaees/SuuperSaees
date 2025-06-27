import { InvoiceRepository } from '../repositories/invoices.repository';
import { InvoiceItemsRepository } from '../repositories/invoice-items.repository';
import { Invoice } from '~/lib/invoice.types';
import { Pagination } from '~/lib/pagination';
import { createUrlForCheckout } from '../../../../../../../packages/features/team-accounts/src/server/actions/services/create/create-token-for-checkout'
import { RetryOperationService } from '@kit/shared/utils';
import { getSession } from '../../accounts/accounts.action';
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemsRepository?: InvoiceItemsRepository,
  ) {}

  // * CREATE SERVICES
  async create(payload: Invoice.Request.Create): Promise<Invoice.Type> {
    // Calculate totals from items
    const subtotal = payload.invoice_items?.reduce((sum, item) => 
      sum + ((item.quantity ?? 0) * (item.unit_price ?? 0)), 0) ?? payload.subtotal_amount ?? 0;

    const taxAmount = payload.tax_amount ?? 0;
    const totalAmount = subtotal + taxAmount;

    const createdInvoice = await this.invoiceRepository.create({
      ...payload,
      subtotal_amount: subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    });

    // Create invoice items if provided
    if (payload.invoice_items && payload.invoice_items.length > 0) {
      await this.invoiceItemsRepository?.createMany(
        createdInvoice.id,
        payload.invoice_items
      );
    }

    const generateCheckoutUrlPromise = new RetryOperationService(
          async () => {
            const organization = (await (getSession())).organization
            const isProd = process.env.NEXT_PUBLIC_IS_PROD === 'true';
            const baseUrl = (organization?.domain?.includes('localhost') ?? !isProd) ? `http://${organization?.domain}` : `https://${organization?.domain}`;

            const checkoutUrl = await createUrlForCheckout({
              stripeId: '',
              priceId: '',
              invoice:  createdInvoice,
              organizationId: organization?.id ?? '',
              baseUrl: baseUrl,
              primaryOwnerId: organization?.owner_id ?? '', 
            });
    
            // Update the invoice with the generated checkout URL
           await this.invoiceRepository.update({
              id: createdInvoice.id,
              checkout_url: checkoutUrl,
            });
    
            return checkoutUrl;
          },
          {
            maxAttempts: 3,
            delayMs: 1000,
            backoffFactor: 2,
          }
        );
    
        generateCheckoutUrlPromise.execute().catch((error) => {
          console.error('Failed to generate checkout URL:', error);
        });

    return createdInvoice;
  }

  // * GET SERVICES
  async list(): Promise<Pagination.Response<Invoice.Response>> {
    const repositoryResponse = await this.invoiceRepository.list();
    
    // Transform repository response to match frontend Pagination.Response structure
    return {
      data: repositoryResponse.data,
      total: repositoryResponse.count,
      limit: repositoryResponse.pagination.limit,
      page: repositoryResponse.pagination.currentPage,
      nextCursor: repositoryResponse.nextCursor,
      prevCursor: null, // Not implemented in repository yet, but part of Pagination.Response
    };
  }

  async get(invoiceId: string): Promise<Invoice.Response> {
    return await this.invoiceRepository.get(invoiceId);
  }

  // * DELETE SERVICES
  async delete(invoiceId: string): Promise<void> {
    // Hard delete invoice items first
    await this.invoiceItemsRepository?.deleteByInvoiceId(invoiceId);
    
    // Then soft delete the invoice
    return await this.invoiceRepository.delete(invoiceId);
  }

  // * UPDATE SERVICES
  async update(payload: Invoice.Request.Update): Promise<Invoice.Type> {
    // Update invoice items if provided
    if (payload.invoice_items) {
      await this.invoiceItemsRepository?.upsert(
        payload.id ?? '',
        payload.invoice_items
      );

      // Recalculate totals
      const subtotal = payload.invoice_items.reduce((sum, item) => 
        sum + ((item.quantity ?? 0) * (item.unit_price ?? 0)), 0);
      
      const taxAmount = payload.tax_amount ?? 0;
      const totalAmount = subtotal + taxAmount;

      payload.subtotal_amount = subtotal;
      payload.total_amount = totalAmount;
    }

    // Remove invoice_items from payload before updating invoice
    const { ...invoicePayload } = payload;
    
    return await this.invoiceRepository.update(invoicePayload);
  }
}