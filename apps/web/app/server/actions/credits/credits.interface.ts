import { Credit } from "~/lib/credit.types";
import { Pagination } from "~/lib/pagination";
import { PaginationConfig } from "../query.config";

export interface ICreditAction {
  // * CREATE INTERFACES
  /**
   * Creates a new credit record for an organization
   * @param {Credit.Request.Create} payload - Data for creating the credit
   * @returns {Promise<Credit.Type>} - The created credit object
   */
  create(payload: Credit.Request.Create): Promise<Credit.Type>;

  // * GET INTERFACES
  /**
   * Retrieves all credits with pagination
   * @param {PaginationConfig} config - Pagination and filter configuration
   * @returns {Promise<Pagination.Response<Credit.Response>>}
   */
  list(config?: PaginationConfig): Promise<Pagination.Response<Credit.Response>>;

  /**
   * Retrieves a specific credit by its ID with all relations
   * @param {string} creditId - The ID of the credit to fetch
   * @returns {Promise<Credit.Response>} - The credit with all relations
   */
  get(creditId: string): Promise<Credit.Response>;

  // * UPDATE INTERFACES
  /**
   * Updates a credit record
   * @param {Credit.Request.Update} payload - Updated credit data
   * @returns {Promise<Credit.Type>}
   */
  update(payload: Credit.Request.Update): Promise<Credit.Type>;

  // * DELETE INTERFACES
  /**
   * Soft deletes a credit by its ID
   * @param {string} creditId - ID of the credit to delete
   * @returns {Promise<void>}
   */
  delete(creditId: string): Promise<void>;
}
