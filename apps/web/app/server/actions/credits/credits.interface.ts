import { Credit } from "~/lib/credit.types";
import { Pagination } from "~/lib/pagination";
import { PaginationConfig } from "../query.config";

export interface ICreditAction {
  // * GET INTERFACES
  /**
   * Retrieves a specific credit by its ID - Used by clients only
   * @param {string} creditId - The ID of the credit to fetch
   * @returns {Promise<Credit.Response>} - The credit with all relations
   */
  get(creditId: string): Promise<Credit.Response>;

  /**
   * Retrieves all credits for an organization - Used by both clients and agencies
   * @param {string} organizationId - Optional organization ID, if not provided uses session
   * @param {PaginationConfig} config - Pagination and filter configuration
   * @returns {Promise<Pagination.Response<Credit.Response>>}
   */
  listByOrganization(organizationId?: string, config?: PaginationConfig): Promise<Pagination.Response<Credit.Response>>;

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
   * Deletes a credit operation (not direct credit deletion)
   * Creates deletion record in credit_operations with status 'consumed'
   * @param {string} creditId - ID of the credit affected
   * @param {string} actorId - ID of the user performing the deletion
   * @param {string} creditOperationId - Optional ID of existing operation to create history
   * @returns {Promise<void>}
   */
  deleteOperation(creditId: string, actorId: string, creditOperationId?: string): Promise<void>;
}
