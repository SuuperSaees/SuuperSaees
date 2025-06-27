import { Invoice } from "~/lib/invoice.types";
import { Pagination } from "~/lib/pagination";
import { PaginationConfig } from "../query.config";

export interface IInvoiceAction {
  //* CREATE INTERFACES
  /**
   * Creates a new invoice with items
   * @param {Invoice.Request.Create} payload - Data for creating the invoice
   * @returns {Promise<Invoice.Type>} - The created invoice object
   */
  create(payload: Invoice.Request.Create): Promise<Invoice.Type>;

  // * GET INTERFACES
  /**
   * Retrieves all invoices with pagination
   * @param {PaginationConfig} config - Pagination and filter configuration
   * @returns {Promise<Pagination.Response<Invoice.Response>>}
   */
  list(config?: PaginationConfig): Promise<Pagination.Response<Invoice.Response>>;

  /**
   * Retrieves a specific invoice by its ID with all relations
   * @param {string} invoiceId - The ID of the invoice to fetch
   * @returns {Promise<Invoice.Response>} - The invoice with all relations
   */
  get(invoiceId: string): Promise<Invoice.Response>;

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
   * @param {Invoice.Request.Update} payload - Updated invoice data
   * @returns {Promise<Invoice.Type>}
   */
  update(payload: Invoice.Request.Update): Promise<Invoice.Type>;
} 