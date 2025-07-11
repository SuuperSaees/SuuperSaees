/**
 * Examples of using the credits system server actions
 * 
 * This file shows how to use the credits system for different scenarios
 * following the business rules documented in Credits.md
 */

import {
  createCredit,
  getCredits,
  getCredit,
  getCreditsByClientOrganization,
  getCreditsByAgency,
  getCreditBalance,
  updateCredit,
  deleteCredit,
  addCredits,
  consumeCredits,
  refundCredits,
  lockCredits,
  transferCredits,
  getCreditHistory,
  getCreditSummary,
} from './credits.action';
import { Credit, CreditOperations } from '~/lib/credit.types';

// Example 1: Creating a new credit record for a client organization
async function createCreditForClient() {
  try {
    const creditPayload: Credit.Request.Create = {
      agency_id: 'agency_uuid_here',
      client_organization_id: 'client_org_uuid_here',
      balance: 0, // Start with 0 balance
      user_id: 'user_uuid_here',
      // Optional: Create initial credit operations
      credit_operations: [
        {
          actor_id: 'user_uuid_here',
          status: CreditOperations.Enums.Status.PURCHASED,
          type: CreditOperations.Enums.Type.SYSTEM,
          quantity: 100,
          description: 'Initial credit allocation',
          credit_id: '', // Will be set automatically
          metadata: {
            initialAllocation: true,
            source: 'onboarding'
          }
        }
      ]
    };

    const newCredit = await createCredit(creditPayload);
    console.log('Created credit:', newCredit);
    return newCredit;
  } catch (error) {
    console.error('Error creating credit:', error);
    throw error;
  }
}

// Example 2: Adding credits to an organization (purchase scenario)
async function purchaseCredits(creditId: string, actorId: string) {
  try {
    const operation = await addCredits(creditId, {
      quantity: 500,
      description: 'Credit purchase - Monthly plan',
      actorId: actorId,
      metadata: {
        paymentMethod: 'stripe',
        transactionId: 'txn_12345',
        plan: 'monthly_500'
      }
    });

    console.log('Credits added:', operation);
    return operation;
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
}

// Example 3: Consuming credits (when a service is used)
async function useCreditsForService(creditId: string, actorId: string, serviceId: string) {
  try {
    // First, check if sufficient balance exists
    const currentBalance = await getCreditBalance(creditId);
    const requiredCredits = 10;

    if (currentBalance < requiredCredits) {
      throw new Error(`Insufficient credits. Available: ${currentBalance}, Required: ${requiredCredits}`);
    }

    const operation = await consumeCredits(creditId, {
      quantity: requiredCredits,
      description: 'Design service consumption',
      actorId: actorId,
      metadata: {
        serviceId: serviceId,
        serviceType: 'logo_design',
        orderId: 'order_123'
      }
    });

    console.log('Credits consumed:', operation);
    return operation;
  } catch (error) {
    console.error('Error consuming credits:', error);
    throw error;
  }
}

// Example 4: Refunding credits (if service was cancelled)
async function refundCreditsForCancelledService(creditId: string, actorId: string, originalOperationId: string) {
  try {
    const operation = await refundCredits(creditId, {
      quantity: 10,
      description: 'Refund for cancelled design service',
      actorId: actorId,
      metadata: {
        originalOperationId: originalOperationId,
        reason: 'service_cancelled',
        refundType: 'full'
      }
    });

    console.log('Credits refunded:', operation);
    return operation;
  } catch (error) {
    console.error('Error refunding credits:', error);
    throw error;
  }
}

// Example 5: Locking credits (reserve for ongoing work)
async function lockCreditsForOngoingWork(creditId: string, actorId: string) {
  try {
    const operation = await lockCredits(creditId, {
      quantity: 25,
      description: 'Credits locked for ongoing project',
      actorId: actorId,
      metadata: {
        projectId: 'proj_456',
        estimatedDuration: '7_days',
        lockReason: 'project_in_progress'
      }
    });

    console.log('Credits locked:', operation);
    return operation;
  } catch (error) {
    console.error('Error locking credits:', error);
    throw error;
  }
}

// Example 6: Transferring credits between organizations (future feature)
async function transferCreditsBetweenOrgs(fromCreditId: string, toCreditId: string, actorId: string) {
  try {
    const operations = await transferCredits({
      fromCreditId: fromCreditId,
      toCreditId: toCreditId,
      quantity: 50,
      description: 'Credit transfer between organizations',
      actorId: actorId,
      metadata: {
        transferType: 'inter_organization',
        approvedBy: actorId,
        reason: 'resource_reallocation'
      }
    });

    console.log('Credits transferred:', operations);
    return operations;
  } catch (error) {
    console.error('Error transferring credits:', error);
    throw error;
  }
}

// Example 7: Getting credits for a client organization
async function getClientCredits(clientOrganizationId: string) {
  try {
    const credits = await getCreditsByClientOrganization(clientOrganizationId);
    console.log('Client credits:', credits);
    return credits;
  } catch (error) {
    console.error('Error fetching client credits:', error);
    throw error;
  }
}

// Example 8: Getting credits managed by an agency
async function getAgencyManagedCredits(agencyId: string) {
  try {
    const credits = await getCreditsByAgency(agencyId);
    console.log('Agency managed credits:', credits);
    return credits;
  } catch (error) {
    console.error('Error fetching agency credits:', error);
    throw error;
  }
}

// Example 9: Getting credit history and summary
async function getCreditAnalytics(creditId: string) {
  try {
    // Get full history
    const history = await getCreditHistory(creditId);
    
    // Get summary statistics
    const summary = await getCreditSummary(creditId);
    
    // Get history for specific date range
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentHistory = await getCreditHistory(
      creditId,
      lastWeek.toISOString(),
      new Date().toISOString()
    );

    console.log('Credit analytics:', {
      history,
      summary,
      recentHistory
    });

    return {
      history,
      summary,
      recentHistory
    };
  } catch (error) {
    console.error('Error fetching credit analytics:', error);
    throw error;
  }
}

// Example 10: Listing all credits with pagination
async function listCreditsWithPagination() {
  try {
    const paginatedCredits = await getCredits({
      pagination: {
        limit: 20,
        page: 1
      }
    });

    console.log('Paginated credits:', paginatedCredits);
    return paginatedCredits;
  } catch (error) {
    console.error('Error listing credits:', error);
    throw error;
  }
}

// Example 11: Complete workflow - Creating credits and using them
async function completeCreditsWorkflow() {
  try {
    // 1. Create credit record
    const credit = await createCreditForClient();
    
    // 2. Purchase credits
    await purchaseCredits(credit.id, 'user_uuid_here');
    
    // 3. Check balance
    const balance = await getCreditBalance(credit.id);
    console.log('Current balance:', balance);
    
    // 4. Use credits for a service
    await useCreditsForService(credit.id, 'user_uuid_here', 'service_123');
    
    // 5. Check final balance
    const finalBalance = await getCreditBalance(credit.id);
    console.log('Final balance:', finalBalance);
    
    // 6. Get summary
    const summary = await getCreditSummary(credit.id);
    console.log('Credit summary:', summary);
    
    return {
      creditId: credit.id,
      initialBalance: balance,
      finalBalance: finalBalance,
      summary: summary
    };
  } catch (error) {
    console.error('Error in complete workflow:', error);
    throw error;
  }
}

export default {
  createCreditForClient,
  purchaseCredits,
  useCreditsForService,
  refundCreditsForCancelledService,
  lockCreditsForOngoingWork,
  transferCreditsBetweenOrgs,
  getClientCredits,
  getAgencyManagedCredits,
  getCreditAnalytics,
  listCreditsWithPagination,
  completeCreditsWorkflow,
};

export {
  createCreditForClient,
  purchaseCredits,
  useCreditsForService,
  refundCreditsForCancelledService,
  lockCreditsForOngoingWork,
  transferCreditsBetweenOrgs,
  getClientCredits,
  getAgencyManagedCredits,
  getCreditAnalytics,
  listCreditsWithPagination,
  completeCreditsWorkflow,
};
