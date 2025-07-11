import { Credit, CreditOperations } from "~/lib/credit.types";
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

  /**
   * Retrieves credits by client organization ID
   * @param {string} clientOrganizationId - The ID of the client organization
   * @returns {Promise<Credit.Response[]>} - Credits for the organization
   */
  getByClientOrganization(clientOrganizationId: string): Promise<Credit.Response[]>;

  /**
   * Retrieves credits by agency ID
   * @param {string} agencyId - The ID of the agency
   * @returns {Promise<Credit.Response[]>} - Credits managed by the agency
   */
  getByAgency(agencyId: string): Promise<Credit.Response[]>;

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

  // * BUSINESS LOGIC INTERFACES
  /**
   * Adds credits to an organization's balance
   * @param {string} creditId - The credit record ID
   * @param {object} operationData - Operation information
   * @returns {Promise<CreditOperations.Type>}
   */
  addCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type>;

  /**
   * Consumes credits from an organization's balance
   * @param {string} creditId - The credit record ID
   * @param {object} operationData - Operation information
   * @returns {Promise<CreditOperations.Type>}
   */
  consumeCredits(
    creditId: string,
    operationData: {
      quantity: number;
      description?: string;
      actorId: string;
      metadata?: any;
    }
  ): Promise<CreditOperations.Type>;

  /**
   * Gets the current balance for a credit record
   * @param {string} creditId - The credit record ID
   * @returns {Promise<number>} - Current balance
   */
  getBalance(creditId: string): Promise<number>;

  /**
   * Transfers credits between organizations (for future implementation)
   * @param {object} transferData - Transfer information
   * @returns {Promise<CreditOperations.Type[]>}
   */
  transferCredits(transferData: {
    fromCreditId: string;
    toCreditId: string;
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }): Promise<CreditOperations.Type[]>;
}
