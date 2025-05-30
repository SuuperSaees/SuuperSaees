import { Invoice } from "~/lib/invoice.types";

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

export interface IInvoiceAction {
  //* CREATE INTERFACES
  /**
   * Creates a new invoice with items
   * @param {Invoice.InsertWithRelations} payload - Data for creating the invoice
   * @returns {Promise<Invoice.Type>} - The created invoice object
   */
  create(payload: Invoice.InsertWithRelations): Promise<Invoice.Type>;

  // * GET INTERFACES
  /**
   * Retrieves all invoices with pagination
   * @param {string} organizationId - Organization ID to filter invoices
   * @param {PaginationConfig} config - Pagination and filter configuration
   * @returns {Promise<{data: Invoice.Response[], nextCursor: string | null, count: number | null, pagination: object}>}
   */
  list(organizationId: string, config?: PaginationConfig): Promise<{
    data: Invoice.Response[];
    nextCursor: string | null;
    count: number | null;
    pagination: {
      limit: number;
      hasNextPage: boolean;
      totalPages: number | null;
      currentPage: number | null;
      isOffsetBased: boolean;
    };
  }>;

  /**
   * Retrieves a specific invoice by its ID with all relations
   * @param {string} invoiceId - The ID of the invoice to fetch
   * @returns {Promise<Invoice.Relational>} - The invoice with all relations
   */
  get(invoiceId: string): Promise<Invoice.Relational>;

  // * DELETE INTERFACES
  /**
   * Soft deletes an invoice by its ID
   * @param {string} invoiceId - ID of the invoice to delete
   * @returns {Promise<void>}
   */
  delete(invoiceId: string): Promise<void>;

  // * UPDATE INTERFACES
  /**
   * Updates an invoice and its items
   * @param {Invoice.Update & {invoice_items?: InvoiceItem.Insert[]}} payload - Updated invoice data
   * @returns {Promise<Invoice.Type>}
   */
  update(payload: Invoice.Update & {invoice_items?: InvoiceItem.Insert[]}): Promise<Invoice.Type>;
} 