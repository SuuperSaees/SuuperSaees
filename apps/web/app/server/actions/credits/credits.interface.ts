import { Credit, CreditOperations } from "~/lib/credit.types";
import { Pagination } from "~/lib/pagination";
import { PaginationConfig } from "../query.config";

export interface ICreditAction {
  // * GET INTERFACES
  /**
   * Retrieves a specific credit based on user session - Used by clients only
   * For client roles: uses organization.id to find their credit
   * For agency roles: requires clientOrganizationId parameter
   * @param {string} clientOrganizationId - Optional client organization ID (required for agencies)
   * @returns {Promise<Credit.Response>} - The credit with all relations
   */
  get(clientOrganizationId?: string): Promise<Credit.Response>;

  /**
   * Retrieves all credit operations with pagination - Used by both clients and agencies
   * @param {PaginationConfig} config - Pagination and filter configuration
   * @returns {Promise<Pagination.Response<CreditOperations.Response>>}
   */
  list(config?: PaginationConfig): Promise<Pagination.Response<CreditOperations.Response>>;

  // * OPERATION INTERFACES (Indirect credit modifications)
  /**
   * Creates a credit operation (not direct credit creation)
   * Generates record in credit_operations, balance updated by triggers
   * @param {Credit.Request.Create} payload - Data for creating the operation
   * @returns {Promise<Credit.Type>} - The affected credit object
   */
  createOperation(payload: Credit.Request.Create): Promise<Credit.Type>;

  /**
   * Updates a credit operation (not direct credit update)
   * If credit_operation_id provided, creates history in metadata
   * @param {Credit.Request.Update} payload - Updated operation data
   * @returns {Promise<Credit.Type>} - The affected credit object
   */
  updateOperation(payload: Credit.Request.Update): Promise<Credit.Type>;

  /**
   * Removes credit operations (not direct credit deletion)
   * Creates removal record in credit_operations with status 'consumed' by default
   * Generates history tracking with oldQuantity and newQuantity
   * @param {Credit.Request.Remove} payload - Data for removing the operations
   * @returns {Promise<Credit.Type>} - The affected credit object
   */
  removeOperation(payload: Credit.Request.Remove): Promise<Credit.Type>;
}
