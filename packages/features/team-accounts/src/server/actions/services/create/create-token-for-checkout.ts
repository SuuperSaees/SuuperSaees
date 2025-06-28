'use server';

import { BillingAccounts } from '../../../../../../../../apps/web/lib/billing-accounts.types';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { Invoice } from '../../../../../../../../apps/web/lib/invoice.types';
import { createToken } from '../../../../../../../tokens/src/create-token';


export const createUrlForCheckout = async ({
  stripeId,
  priceId,
  service,
  invoice,
  organizationId,
  paymentMethods,
  baseUrl,
  primaryOwnerId,
}: {
  stripeId?: string;
  priceId?: string;
  service?: Service.Relationships.Billing.BillingService | Service.Type;
  invoice?: Invoice.Type;
  organizationId: string;
  paymentMethods?: BillingAccounts.PaymentMethod[];
  baseUrl: string;
  primaryOwnerId: string;
}) => {
  try {
    // Validate input parameters
    if ((!service && !invoice) || !organizationId) {
      throw new Error(
        'Missing required parameters: ' +
          JSON.stringify({
            hasService: !!service,
            hasInvoice: !!invoice,
            hasOrgId: !!organizationId,
          }),
      );
    }

    let token: { accessToken: string; tokenId: string } | undefined;

    try {
      token = await createToken({
        account_id: stripeId ?? '',
        price_id: priceId ?? '',
        service: service as NonNullable<typeof service>,
        invoice: invoice,
        expires_at: new Date(),
        organization_id: organizationId,
        payment_methods: paymentMethods ?? [],
        primary_owner_id: primaryOwnerId,
      });
    } catch (tokenError: unknown) {
      console.error('Token creation failed:', {
        error: tokenError instanceof Error ? tokenError.message : String(tokenError),
        code: tokenError instanceof Error && 'code' in tokenError ? (tokenError as {code: unknown}).code : undefined,
        stack: tokenError instanceof Error ? tokenError.stack : undefined,
      });
      throw tokenError;
    }

    const url = `${baseUrl}/checkout?tokenId=${token.tokenId}`;

    return url;
  } catch (error) {
    // Enhanced error logging
    console.error('createUrlForCheckout failed:', {
      errorName: error instanceof Error ? error.name : String(error),
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode: error instanceof Error && 'code' in error ? (error as {code: unknown}).code : undefined,
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: Object.prototype.toString.call(error),
      params: {
        hasPriceId: !!priceId,
        hasService: !!service,
        hasOrgId: !!organizationId,
      },
    });
    throw error;
  }
};