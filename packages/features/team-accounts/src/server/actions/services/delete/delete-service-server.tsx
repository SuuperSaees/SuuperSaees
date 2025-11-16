'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Client } from '../../../../../../../../apps/web/lib/client.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { fetchClientByOrgId } from '../../clients/get/get-clients';
import {
  fetchCurrentUser,
  getStripeAccountID,
} from '../../members/get/get-member-account';
import { hasPermissionToDeleteClientService } from '../../permissions/services';
// import { getDomainByUserId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { CustomError, CustomResponse, ErrorServiceOperations } from '../../../../../../../shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { revalidatePath } from 'next/cache';
// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const deleteService = async (serviceId: number) => {
  try {
    const { userId } = await getStripeAccountID();
    if (!userId) throw new Error('No user found');

    // API call to disable product and price in Stripe
    // const {domain: baseUrl} = await getDomainByUserId(userId, true);
    // const response = await fetch(`${baseUrl}/api/stripe/delete-service?priceId=${encodeURIComponent(priceId)}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     priceId: priceId,
    //     accountId: stripeId,
    //   }),
    // });

    // if (!response.ok) {
    //   const errorData = await response.clone().json();
    //   throw new CustomError(
    //     HttpStatus.Error.InternalServerError,
    //     `Error deleting price and product in Stripe: ${errorData.error?.message}`,
    //     ErrorServiceOperations.FAILED_TO_DELETE_SERVICE_FROM_STRIPE,
    //   );
    // }

    const client = getSupabaseServerComponentClient();

    // Delete the service from the database
    const { error: deleteServiceError } = await client
      .from('services')
      .update({ deleted_on: new Date().toISOString(), status: 'inactive' })
      .eq('id', serviceId)

      if (deleteServiceError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error deleting the service: ${deleteServiceError.message}`,
          ErrorServiceOperations.FAILED_TO_DELETE_SERVICE,
        );
      }

    // Unlink the briefs related to the service
    const { error: unlinkBriefsError } = await client
      .from('service_briefs')
      .delete()
      .eq('service_id', serviceId);

      if (unlinkBriefsError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error unlinking briefs: ${unlinkBriefsError.message}`,
          ErrorServiceOperations.FAILED_TO_DELETE_SERVICE,
        );
      }

    revalidatePath('/services');
    return CustomResponse.success(null, 'serviceDeleted').toJSON();
  } catch (error) {
    console.error('Error deleting the service:', error);
    return CustomResponse.error(error).toJSON();
  }
};


export async function deleteClientService(
  clientOrganizationId: string,
  serviceId: Service.Type['id'],
  serviceSubscriptionId: Service.Relationships.Client.Response['id'],
) {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Verify the user
    const user = await fetchCurrentUser(client);
    if (!user) throw new Error('No user found');

    // Step 2: Get the client ID
    const clientData = await fetchClientByOrgId(client, clientOrganizationId);

    const clientId = clientData[0]?.id;
    const clientAgencyId = clientData[0]?.agency_id;
    if (!clientId || !clientAgencyId) throw new Error('No client found');

    // Step 3: Verify the permision to delete
    const hasPermission =
      await hasPermissionToDeleteClientService(clientAgencyId);
    if (!hasPermission) throw new CustomError(  
      HttpStatus.Error.Unauthorized,
      'You do not have the required permissions to cancel this service',
      ErrorServiceOperations.INSUFFICIENT_PERMISSIONS,
    );

    // Step 4: Delete the specified service from the client organization
    const deleteData = await deleteServiceFromClient(
      client,
      clientOrganizationId,
      serviceId,
      clientId ?? '',
      serviceSubscriptionId,
    );

    revalidatePath('/services');
    return CustomResponse.success(deleteData, 'serviceCancelled').toJSON();
  } catch (error) {
    console.error('Error while deleting service from client', error);
    return CustomResponse.error(error).toJSON();
  }
}

export async function deleteServiceFromClient(
  client: SupabaseClient<Database>,
  clientOrganizationId: string,
  serviceId: Service.Type['id'],
  clientId: Client.Type['id'],
  subscriptionId: Service.Relationships.Client.Response['id'],
) {
  try {
    const { data: deleteData, error: deleteError } = await client
      .from('client_services')
      .delete()
      .eq('id', subscriptionId);

    if (deleteError)
      throw new Error(
        `Error while trying to delete service from client, ${deleteError.message}`,
      );

    return deleteData;
  } catch (error) {
    console.error('Error while deleting service from client', error);
    throw error;
  }
}