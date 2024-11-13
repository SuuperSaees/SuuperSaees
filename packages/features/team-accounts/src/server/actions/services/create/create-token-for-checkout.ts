'use server';

import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { getDomainByOrganizationId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { createToken } from '../../../../../../../tokens/src/create-token';

export const createUrlForCheckout = async ({
  stripeId,
  priceId,
  service,
  organizationId,
}: {
  stripeId: string;
  priceId: string;
  service: Service.Type;
  organizationId: string;
}) => {
  try {
    // Validate input parameters
    if (!stripeId || !priceId || !service || !organizationId) {
      throw new Error(
        'Missing required parameters: ' +
          JSON.stringify({
            hasStripeId: !!stripeId,
            hasPriceId: !!priceId,
            hasService: !!service,
            hasOrgId: !!organizationId,
          }),
      );
    }

    let token: { accessToken: string; tokenId: string } | undefined;

    try {
      token = await createToken({
        account_id: stripeId,
        price_id: priceId,
        service: service,
        expires_at: new Date(),
        organization_id: organizationId,
      });
    } catch (tokenError) {
      console.error('Token creation failed:', {
        error: tokenError.message,
        code: tokenError.code,
        stack: tokenError.stack,
      });
      throw tokenError;
    }

    let baseUrl: string | undefined;
    try {
      baseUrl = await getDomainByOrganizationId(organizationId, true, true);
    } catch (domainError) {
      console.error('Domain retrieval failed:', {
        error: domainError.message,
        code: domainError.code,
        stack: domainError.stack,
      });
      throw domainError;
    }

    if (!baseUrl) {
      throw new Error(
        `Invalid baseUrl returned for organizationId: ${organizationId}`,
      );
    }
    

    const url = `${baseUrl}/checkout?tokenId=${token.tokenId}`;

    return url;
  } catch (error) {
    // Enhanced error logging
    console.error('createUrlForCheckout failed:', {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack,
      errorType: Object.prototype.toString.call(error),
      params: {
        hasStripeId: !!stripeId,
        hasPriceId: !!priceId,
        hasService: !!service,
        hasOrgId: !!organizationId,
      },
    });
    throw error;
  }
};