'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Pagination } from '~/lib/pagination';
import { Service } from '~/lib/services.types';
import { getPrimaryOwnerId } from '~/team-accounts/src/server/actions/members/get/get-member-account';


export const getServicesByOrganizationId = async (config?: Pagination.Request): Promise<Service.Relationships.Billing.BillingService[]> => {
  const client = getSupabaseServerComponentClient();
  const primary_owner_user_id = await getPrimaryOwnerId();
  
  try {
    const { data: products, error } = await client
      .from('services')
      .select('*, billing_services!left(provider_id, provider).service_id(id)')
      .eq('propietary_organization_id', primary_owner_user_id ?? '')
      .is('deleted_on', null)
      .order('created_at', { ascending: false })
      .returns<Service.Relationships.Billing.BillingService[]>();

    if (error) throw new Error(error.message);
    
    return products
  } catch (error) {
    console.error('Error fetching products or prices:', error);
    return [];
  }
};