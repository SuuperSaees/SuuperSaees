'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import {
  fetchCurrentUser,
  getPrimaryOwnerId,
} from '../../members/get/get-member-account';
import { getAgencyForClient } from '../../organizations/get/get-organizations';
import { hasPermissionToReadClientServices } from '../../permissions/services';

export const getServiceById = async (
  serviceId: Service.Type['id'],
  briefsNeeded?: boolean,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    if (briefsNeeded) {
      const { data: serviceData, error: serviceError } = await client
        .from('services')
        .select(
          `*, 
        service_briefs(*, 
          brief:briefs(id, name, description, created_at)
        )`,
        )
        .eq('id', serviceId)
        .is('deleted_on', null)
        .single();

      if (serviceError) throw serviceError.message;

      const proccesedData = {
        ...serviceData,
      };

      return proccesedData;
    }

    const { data: serviceData, error: orderError } = await client
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .is('deleted_on', null)
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

export const getServices = async (): Promise<Service.Response[]> => {
  const client = getSupabaseServerComponentClient();
  const primary_owner_user_id = await getPrimaryOwnerId();

  try {
    const { data: services, error } = await client
      .from('services')
      .select(
        'id, name, created_at, price, number_of_clients, status, propietary_organization_id, service_image, service_description',
      )
      .eq('propietary_organization_id', primary_owner_user_id ?? '')
      .is('deleted_on', null);

    if (error) throw new Error(error.message);

    return services;
  } catch (error) {
    console.error('Error fetching products or prices:', error);
    throw error;
  }
};

export async function fetchClientServices(
  client: SupabaseClient<Database>,
  clientOrganizationId: string,
) {
  try {
    
    const { data: clientServicesData, error: clientServicesError } =
      await client
        .from('client_services')
        .select('id, created_at, info:services(id, name, price, service_description, service_image)')
        .eq('client_organization_id', clientOrganizationId);

    if (clientServicesError) {

      throw new Error(
        `Error getting client services, ${clientServicesError.message}`,
      );
    }

    return clientServicesData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getClientServices(
  clientOrganizationId: string,
): Promise<Service.Relationships.Client.Response[]> {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Verify the user
    const user = await fetchCurrentUser(client);
    if (!user) throw new Error('No user found');

    // Step 2: Get the client's service
    const clientServiceData= await fetchClientServices(client, clientOrganizationId)

    // Step 3: Get the client's agency
    const agencyData = await getAgencyForClient(clientOrganizationId);
    if (!agencyData) throw new Error('No agency found');

    // Step 3: Verify permissions
    const hasPermission = await hasPermissionToReadClientServices(
      clientOrganizationId,
      agencyData?.id,
    );

    if (!hasPermission)
      throw new Error('No permission to read client services');

    // Step 4: Combine the data

    const combinedData = clientServiceData.map((serviceClient) => {
      const { id, created_at } = serviceClient;
      const {
        id: serviceId,
        name,
        price,
        service_description,
        service_image,
      } = serviceClient.info ?? {};

      return {
        subscription_id: id,
        id: serviceId ?? -1,
        created_at: created_at,
        name: name ?? '', // Use null if name is undefined
        price: price ?? null, // Use null if price is undefined
        service_description: service_description ?? null, // Use null if service_description is undefined
        service_image: service_image ?? null, // Use null if service_image is undefined
      };
    });

    return combinedData;
  } catch (error) {
    console.error('Error while getting client services:', error);
    throw error;
  }
}
