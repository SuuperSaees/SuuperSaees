import { Checkout } from "~/lib/checkout.types";

export interface ICheckoutAction {
  // * CREATE INTERFACES
  /**
   * Creates a new checkout
   * @param {Checkout.Request.Create} payload - Data for creating the checkout
   * @returns {Promise<Checkout.Response>} - The created checkout object
   */
  create(payload: Checkout.Request.Create): Promise<Checkout.Response>;


  // * GET INTERFACES
  /**
   * Retrieves a checkout by its ID
   * @param {string} checkoutId - The ID of the checkout to fetch
   * @returns {Promise<Checkout.Response>} - The checkout object
   */
  get(checkoutId: string): Promise<Checkout.Response>;


  // * UPDATE INTERFACES
  /**
   * Updates a checkout
   * @param {Checkout.Request.Update} payload - Updated checkout data
   * @returns {Promise<Checkout.Response>}
   */
  update(payload: Checkout.Request.Update): Promise<Checkout.Response>;
}