import { InvoicePayment } from "~/lib/invoice-payment.types";

export interface IInvoicePaymentAction {
  // * CREATE INTERFACES
  /**
   * Creates a new invoice payment
   * @param {InvoicePayment.Request.Create} payload - Data for creating the payment
   * @returns {Promise<InvoicePayment.Type>} - The created payment object
   */
  create(payload: InvoicePayment.Request.Create): Promise<InvoicePayment.Type>;

  // * GET INTERFACES
  /**
   * Retrieves all payments for a specific invoice
   * @param {string} invoiceId - The ID of the invoice
   * @returns {Promise<InvoicePayment.Response[]>} - Array of payments for the invoice
   */
  getByInvoiceId(invoiceId: string): Promise<InvoicePayment.Response[]>;

  /**
   * Retrieves a specific payment by its ID
   * @param {string} paymentId - The ID of the payment to fetch
   * @returns {Promise<InvoicePayment.Response>} - The payment with relations
   */
  get(paymentId: string): Promise<InvoicePayment.Response>;

  // * UPDATE INTERFACES
  /**
   * Updates a payment
   * @param {InvoicePayment.Request.Update} payload - Updated payment data
   * @returns {Promise<InvoicePayment.Type>}
   */
  update(payload: InvoicePayment.Request.Update): Promise<InvoicePayment.Type>;

  // * DELETE INTERFACES
  /**
   * Deletes a payment by its ID
   * @param {string} paymentId - ID of the payment to delete
   * @returns {Promise<void>}
   */
  delete(paymentId: string): Promise<void>;

  // * BUSINESS LOGIC INTERFACES
  /**
   * Processes a manual payment for an invoice
   * @param {string} invoiceId - The invoice ID
   * @param {object} paymentData - Payment information
   * @returns {Promise<InvoicePayment.Type>}
   */
  processManualPayment(
    invoiceId: string,
    paymentData: {
      amount: number;
      currency: string;
      paymentMethod: string;
      notes?: string;
      referenceNumber?: string;
    }
  ): Promise<InvoicePayment.Type>;
}