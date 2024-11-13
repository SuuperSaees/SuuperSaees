'use server';

import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { getDomainByOrganizationId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { createToken } from '../../../../../../../tokens/src/create-token';


// export const createUrlForCheckout = async ({
//   stripeId,
//   priceId,
//   service,
//   organizationId,
// }: {
//   stripeId: string;
//   priceId: string;
//   service: Service.Type;
//   organizationId: string;
// }) => {
  
//   console.log('stripeId', stripeId);
//   console.log('priceId', priceId);
//   console.log('service', service);
//   console.log('organizationId', organizationId);

//   try {
//     const token = await createToken({
//       account_id: stripeId,
//       price_id: priceId,
//       service: service,
//       expires_at: new Date(),
//       organization_id: organizationId,
//     });

//     console.log('token', token);
  
//     const baseUrl = await getDomainByOrganizationId(organizationId, true);

//     console.log('baseUrl', baseUrl);
  
//     const url = `${baseUrl}/checkout?tokenId=${token.tokenId}`;

//     console.log('url', url);
  
    
  
//     return url;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

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
  console.log('createUrlForCheckout - Starting with params:', {
    stripeId: stripeId ? 'present' : 'missing',
    priceId: priceId ? 'present' : 'missing',
    service: service ? service : 'missing',
    organizationId: organizationId ? 'present' : 'missing',
  });

  try {
    // Validate input parameters
    if (!stripeId || !priceId || !service || !organizationId) {
      throw new Error('Missing required parameters: ' + 
        JSON.stringify({
          hasStripeId: !!stripeId,
          hasPriceId: !!priceId,
          hasService: !!service,
          hasOrgId: !!organizationId
        })
      );
    }

    console.log('Creating token...');
    let token: { accessToken: string; tokenId: string } | undefined;
    return "esta es una url de prueba";
    try {
      token = await createToken({
        account_id: stripeId,
        price_id: priceId,
        service: service,
        expires_at: new Date(),
        organization_id: organizationId,
      });
    } catch (tokenError: any) {
      console.error('Token creation failed:', {
        error: tokenError.message,
        code: tokenError.code,
        stack: tokenError.stack,
      });
      throw tokenError;
    }

    console.log('Token created successfully:', { tokenId: token?.tokenId });

    let baseUrl: string | undefined;
    try {
      baseUrl = await getDomainByOrganizationId(organizationId, true, true);
    } catch (domainError: any) {
      console.error('Domain retrieval failed:', {
        error: domainError.message,
        code: domainError.code,
        stack: domainError.stack,
      });
      throw domainError;
    }

    if (!baseUrl) {
      throw new Error(`Invalid baseUrl returned for organizationId: ${organizationId}`);
    }

    const url = `${baseUrl}/checkout?tokenId=${token.tokenId}`;
    console.log('Final URL created:', url);

    return url;
  } catch (error: any) {
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
        hasOrgId: !!organizationId
      }
    });
    throw error;
  }
};