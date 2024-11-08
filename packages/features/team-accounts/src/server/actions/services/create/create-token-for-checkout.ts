'use server';

import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { createToken } from '../../../../../../../tokens/src/create-token';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'localhost:3000';

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
  const token = await createToken({
    account_id: stripeId,
    price_id: priceId,
    service: service,
    expires_at: new Date(),
    organization_id: organizationId,
  });

  const url = `${baseUrl}checkout?tokenId=${token.tokenId}`;

  return url;
};
