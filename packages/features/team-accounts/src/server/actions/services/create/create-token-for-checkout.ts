'use server';

import { BillingAccounts } from '../../../../../../../../apps/web/lib/billing-accounts.types';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { createToken } from '../../../../../../../tokens/src/create-token';


export const createUrlForCheckout = async ({
  stripeId,
  priceId,
  service,
  organizationId,
  paymentMethods,
  baseUrl,
}: {
  stripeId?: string;
  priceId: string;
  service: Service.Relationships.Billing.BillingService;
  organizationId: string;
  paymentMethods: BillingAccounts.PaymentMethod[];
  baseUrl: string;
}) => {
  try {
    // Validate input parameters
    if (!service || !organizationId) {
      throw new Error(
        'Missing required parameters: ' +
          JSON.stringify({
            hasService: !!service,
            hasOrgId: !!organizationId,
          }),
      );
    }

    let token: { accessToken: string; tokenId: string } | undefined;

    try {
      token = await createToken({
        account_id: stripeId ?? '',
        price_id: priceId,
        service: service,
        expires_at: new Date(),
        organization_id: organizationId,
        payment_methods: paymentMethods ?? {
          id: '',
          name: '',
          icon: '',
          description: '',
        },
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