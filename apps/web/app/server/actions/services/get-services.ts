'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Pagination } from '~/lib/pagination';
import { Service } from '~/lib/services.types';
import { getPrimaryOwnerId } from '~/team-accounts/src/server/actions/members/get/get-member-account';

import { QueryBuilder, QueryConfigurations } from '../query.config';
import { transformToPaginatedResponse } from '../utils/response-transformers';

export const getServicesByOrganizationId = async (
  config?: QueryConfigurations<Service.Relationships.Billing.BillingService>,
): Promise<
  Pagination.Response<Service.Relationships.Billing.BillingService> | Service.Relationships.Billing.BillingService[]
> => {
  const client = getSupabaseServerComponentClient();
  const primary_owner_user_id = await getPrimaryOwnerId();

  try {
    const initialQuery = client
      .from('services')
      .select(
        '*, billing_services!left(provider_id, provider).service_id(id)',
        config ? { count: 'exact' } : undefined,
      )
      .eq('propietary_organization_id', primary_owner_user_id ?? '')
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    const paginatedProducts = QueryBuilder.getInstance().enhance(initialQuery, config);
    const response = await paginatedProducts;

    if (config?.pagination) {
      const paginatedResponse =
      transformToPaginatedResponse<Service.Relationships.Billing.BillingService>(
        response,
        config?.pagination ?? {},
      );
    return paginatedResponse;
    }

    return response.data ?? [];
  } catch (error) {
    console.error('Error fetching products or prices:', error);
    return transformToPaginatedResponse<Service.Relationships.Billing.BillingService>(
      [],
      {},
    );
  }
};
