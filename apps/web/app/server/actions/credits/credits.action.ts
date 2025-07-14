'use server';

import { createCreditAction } from './credits';
import { Credit } from '~/lib/credit.types';
import { PaginationConfig } from '../query.config';

function getCreditAction() {
  return createCreditAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

// * CREATE ACTIONS
export async function createCredit(payload: Credit.Request.Create) {
  return await getCreditAction().create(payload);
}

// * GET ACTIONS
export async function getCredits(config?: PaginationConfig) {
  return await getCreditAction().list(config);
}

export async function getCredit(creditId: string) {
  return await getCreditAction().get(creditId);
}

// * UPDATE ACTIONS
export async function updateCredit(payload: Credit.Request.Update) {
  return await getCreditAction().update(payload);
}

// * DELETE ACTIONS
export async function deleteCredit(creditId: string) {
  return await getCreditAction().delete(creditId);
}