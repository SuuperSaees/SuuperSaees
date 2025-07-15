'use server';

import { createCreditAction } from './credits';
import { Credit } from '~/lib/credit.types';
import { PaginationConfig } from '../query.config';

function getCreditAction() {
  return createCreditAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

// * GET ACTIONS
/**
 * Get specific credit - Used by clients only
 * For client roles: uses organization.id to find their credit
 * For agency roles: requires clientOrganizationId parameter
 * @param clientOrganizationId - Optional client organization ID (required for agencies)
 */
export async function getCredit(clientOrganizationId?: string) {
  return await getCreditAction().get(clientOrganizationId);
}

/**
 * Get all credit operations with pagination - Used by both clients and agencies
 * @param config - Optional pagination and filter configuration
 */
export async function getCredits(config?: PaginationConfig) {
  return await getCreditAction().list(config);
}

// * OPERATION ACTIONS (Indirect credit modifications)
/**
 * Create credit operation - Does NOT directly affect credits table
 * Generates record in credit_operations, triggers handle balance update
 */
export async function createCredit(payload: Credit.Request.Create) {
  return await getCreditAction().createOperation(payload);
}

/**
 * Update credit operation - Does NOT directly affect credits table
 * If credit_operation_id provided, creates history in metadata
 */
export async function updateCredit(payload: Credit.Request.Update) {
  return await getCreditAction().updateOperation(payload);
}

/**
 * Remove credit operations - Does NOT directly affect credits table
 * Creates removal record in credit_operations with status 'consumed' by default
 * Generates history tracking with oldQuantity and newQuantity
 */
export async function removeCredit(payload: Credit.Request.Remove) {
  return await getCreditAction().removeOperation(payload);
}