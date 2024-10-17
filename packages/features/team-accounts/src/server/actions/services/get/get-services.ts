'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Service } from '../../../../../../../../apps/web/lib/services.types';
import {
  fetchCurrentUser,
  getPrimaryOwnerId,
} from '../../members/get/get-member-account';
import { getAgencyForClient } from '../../organizations/get/get-organizations';
import { hasPermissionToReadClientServices } from '../../permissions/services';

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

export const getServices = async (): Promise<Service.Response[]> => {
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

export async function getClientServices(
  clientOrganizationId: string,
): Promise<Service.Relationships.Client.Response[]> {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Verify the user
    const user = await fetchCurrentUser(client);
    if (!user) throw new Error('No user found');

    // Step 2: Get the client's service
    const { data: clientServiceData, error: clientServiceError } = await client
      .from('client_services')
      .select(
        'id, created_at, info:services(id, name, price, service_description, service_image)',
      )
      .eq('client_organization_id', clientOrganizationId);

    if (clientServiceError) {
      throw new Error(
        `Error while getting client services: ${clientServiceError.message}`,
      );
    }

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

export async function getServiceBriefs(serviceId: Service.Type['id']) {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Verify the user
    const user = await fetchCurrentUser(client);
    if (!user) throw new Error('No user found');

    // Step 2: Get the service's briefs
    const { data: serviceBriefData, error: serviceBriefDataError } =
      await client
        .from('service_briefs')
        .select('brief_id')
        .eq('service_id', serviceId);

    if (serviceBriefDataError) {
      throw new Error(
        `Error while getting service briefs: ${serviceBriefDataError.message}`,
      );
    }

    // Filtrar ids inválidos antes de la siguiente consulta
    const validBriefIds = (serviceBriefData || [])
      .map((brief) => brief.brief_id)
      .filter((briefId) => typeof briefId === 'string' && briefId.length > 0); // Filtrar valores vacíos o no válidos

    if (validBriefIds.length === 0) {
      return []; // Si no hay ids válidos, retornar un array vacío
    }

    // Step 3: Get the briefs
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select('id, name')
      .in('id', validBriefIds);

    if (briefsError) {
      throw new Error(`Error while getting briefs: ${briefsError.message}`);
    }

    return briefsData || [];
  } catch (error) {
    console.error('Error while getting briefs:', error);
    throw error;
  }
}
