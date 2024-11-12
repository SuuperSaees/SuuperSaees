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
  console.log('stripeId', stripeId);
  console.log('priceId', priceId);
  console.log('service', service);
  console.log('organizationId', organizationId);

  try {
    const token = await createToken({
      account_id: stripeId,
      price_id: priceId,
      service: service,
      expires_at: new Date(),
      organization_id: organizationId,
    });

    console.log('token', token);
  
    const baseUrl = await getDomainByOrganizationId(organizationId, true);

    console.log('baseUrl', baseUrl);
  
    const url = `${baseUrl}/checkout?tokenId=${token.tokenId}`;

    console.log('url', url);
  
    
  
    return url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
