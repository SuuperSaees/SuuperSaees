'use server';

import { createCreditAction } from './credits';
import { Credit } from '~/lib/credit.types';
import { PaginationConfig } from '../query.config';

function getCreditAction() {
  return createCreditAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

// * GET ACTIONS
/**
 * Get specific credit by ID - Used by clients only
 * @param creditId - ID of the credit to fetch
 */
export async function getCredit(creditId: string) {
  return await getCreditAction().get(creditId);
}

/**
 * Get all credits for an organization - Used by both clients and agencies
 * @param organizationId - Optional organization ID, if not provided uses session
 * @param config - Optional pagination configuration
 */
export async function getCredits(organizationId?: string, config?: PaginationConfig) {
  return await getCreditAction().listByOrganization(organizationId, config);
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
 * Delete credit operation - Does NOT directly affect credits table
 * Creates deletion record in credit_operations with status 'consumed'
 */
export async function deleteCredit(creditId: string, actorId: string, creditOperationId?: string) {
  return await getCreditAction().deleteOperation(creditId, actorId, creditOperationId);
}