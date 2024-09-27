'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';

// id, name, created_at, price, number_of_clients, status, propietary_organization_id, service_image, service_description
type ServiceGet = Pick<
  Service.Type,
  | 'created_at'
  | 'id'
  | 'name'
  | 'price'
  | 'number_of_clients'
  | 'status'
  | 'propietary_organization_id'
  | 'service_image'
  | 'service_description'
>;
export const getServiceById = async (serviceId: Service.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: serviceData, error: orderError } = await client
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (orderError) throw orderError.message;

    const proccesedData = {
      ...serviceData,
    };

    return proccesedData;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

export const getServices = async (): Promise<ServiceGet[]> => {
  const client = getSupabaseServerComponentClient();
  const primary_owner_user_id = await getPrimaryOwnerId();

  try {
    const { data: services, error } = await client
      .from('services')
      .select(
        'id, name, created_at, price, number_of_clients, status, propietary_organization_id, service_image, service_description',
      )
      .eq('propietary_organization_id', primary_owner_user_id ?? '');

    if (error) throw new Error(error.message);

    return services;
  } catch (error) {
    console.error('Error fetching products or prices:', error);
    throw error;
  }
};