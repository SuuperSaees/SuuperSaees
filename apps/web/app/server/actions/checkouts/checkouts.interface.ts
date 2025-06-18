import { CheckoutInsert, CheckoutType } from './repositories/checkouts.repository';
import { CreateCheckoutWithServicePayload, CheckoutWithServices } from './services/checkouts.service';

export interface ICheckoutAction {
  // * CREATE INTERFACES
  /**
   * Creates a new checkout
   * @param {CheckoutInsert} payload - Data for creating the checkout
   * @returns {Promise<CheckoutType>} - The created checkout object
   */
  create(payload: CheckoutInsert): Promise<CheckoutType>;

  /**
   * Creates a checkout with associated service in one transaction
   * @param {CreateCheckoutWithServicePayload} payload - Data for creating checkout and service
   * @returns {Promise<CheckoutWithServices>} - The created checkout with services
   */
  createWithService(payload: CreateCheckoutWithServicePayload): Promise<CheckoutWithServices>;

  // * GET INTERFACES
  /**
   * Retrieves a checkout by its ID
   * @param {string} checkoutId - The ID of the checkout to fetch
   * @returns {Promise<CheckoutType>} - The checkout object
   */
  get(checkoutId: string): Promise<CheckoutType>;

  /**
   * Retrieves a checkout by provider ID
   * @param {string} providerId - The provider ID to search for
   * @returns {Promise<CheckoutType>} - The checkout object
   */
  getByProviderId(providerId: string): Promise<CheckoutType>;

  /**
   * Retrieves a checkout with its associated services
   * @param {string} checkoutId - The ID of the checkout to fetch
   * @returns {Promise<CheckoutWithServices>} - The checkout with services
   */
  getWithServices(checkoutId: string): Promise<CheckoutWithServices>;

  // * UPDATE INTERFACES
  /**
   * Updates a checkout
   * @param {string} checkoutId - The ID of the checkout to update
   * @param {Partial<CheckoutInsert>} updates - Updated checkout data
   * @returns {Promise<CheckoutType>}
   */
  update(checkoutId: string, updates: Partial<CheckoutInsert>): Promise<CheckoutType>;
}