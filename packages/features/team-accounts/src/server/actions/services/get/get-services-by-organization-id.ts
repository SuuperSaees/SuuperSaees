'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';

export const getServicesByOrganizationId = async (): Promise<{
  products: Service.Relationships.Billing.BillingService[];
}> => {
  const client = getSupabaseServerComponentClient();
  const primary_owner_user_id = await getPrimaryOwnerId();
  // const accountMemberShipData = await getUserIdOfAgencyOwner()
  // if (!primary_owner_user_id) throw new Error('No primary owner found')
  try {
    const { data: fetchedProducts, error } = await client
      .from('services')
      .select('*, billing_services!left(provider_id, provider).service_id(id)')
      .eq('propietary_organization_id', primary_owner_user_id ?? '')
      .is('deleted_on', null)
      .returns<Service.Relationships.Billing.BillingService[]>();

    if (error) throw new Error(error.message);
    return {
      products: [...fetchedProducts],
    };
  } catch (error) {
    console.error('Error fetching products or prices:', error);
    return {
      products: [],
    };
  }
};