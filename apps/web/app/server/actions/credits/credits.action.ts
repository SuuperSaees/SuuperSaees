'use server';

import { createCreditAction } from './credits';
import { Credit, CreditOperations } from '~/lib/credit.types';
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

export async function getCreditsByClientOrganization(clientOrganizationId: string) {
  return await getCreditAction().getByClientOrganization(clientOrganizationId);
}

export async function getCreditsByAgency(agencyId: string) {
  return await getCreditAction().getByAgency(agencyId);
}

export async function getCreditBalance(creditId: string) {
  return await getCreditAction().getBalance(creditId);
}

// * UPDATE ACTIONS
export async function updateCredit(payload: Credit.Request.Update) {
  return await getCreditAction().update(payload);
}

// * DELETE ACTIONS
export async function deleteCredit(creditId: string) {
  return await getCreditAction().delete(creditId);
}

// * BUSINESS LOGIC ACTIONS
export async function addCredits(
  creditId: string,
  operationData: {
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }
) {
  return await getCreditAction().addCredits(creditId, operationData);
}

export async function consumeCredits(
  creditId: string,
  operationData: {
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }
) {
  return await getCreditAction().consumeCredits(creditId, operationData);
}

export async function refundCredits(
  creditId: string,
  operationData: {
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }
) {
  return await getCreditAction().refundCredits(creditId, operationData);
}

export async function lockCredits(
  creditId: string,
  operationData: {
    quantity: number;
    description?: string;
    actorId: string;
    metadata?: any;
  }
) {
  return await getCreditAction().lockCredits(creditId, operationData);
}

export async function transferCredits(transferData: {
  fromCreditId: string;
  toCreditId: string;
  quantity: number;
  description?: string;
  actorId: string;
  metadata?: any;
}) {
  return await getCreditAction().transferCredits(transferData);
}

// * UTILITY ACTIONS
export async function getCreditHistory(
  creditId: string,
  startDate?: string,
  endDate?: string
) {
  return await getCreditAction().getCreditHistory(creditId, startDate, endDate);
}

export async function getCreditSummary(creditId: string) {
  return await getCreditAction().getCreditSummary(creditId);
}

// * CREDIT OPERATIONS SPECIFIC ACTIONS
export async function getCreditOperationsByCredit(creditId: string) {
  return await getCreditAction().getCreditHistory(creditId);
}

export async function getCreditOperationsByDateRange(
  creditId: string,
  startDate: string,
  endDate: string
) {
  return await getCreditAction().getCreditHistory(creditId, startDate, endDate);
}
