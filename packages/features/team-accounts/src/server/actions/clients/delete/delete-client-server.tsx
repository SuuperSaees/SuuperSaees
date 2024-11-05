'use server';

import { ErrorClientOperations, ErrorOrderOperations, ErrorUserOperations } from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { CustomError } from '../../../../../../../shared/src/response/errors/custom-errors';
import { CustomResponse } from '../../../../../../../shared/src/response/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import {
  getAgencyForClient, // getOrganizationById,
} from '../../organizations/get/get-organizations';
import { hasPermissionToDeleteClient } from '../../permissions/clients';

// Define la función handleDelete
export const deleteClient = async (
  clientId: string,
  organizationId?: string,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    console.log('ids',clientId, organizationId);
    // Step 1: Determine the organization ID and check for required permissions
    let clientOrganizationId = organizationId;
    if (clientId && !organizationId) {
      // Fetch the organization ID for the specific client if not provided
      const { data: clientAccount, error: clientAccountError } = await client
        .from('accounts')
        .select('organization_id')
        .eq('id', clientId)
        .single();

      if (clientAccountError ?? !clientAccount?.organization_id) {
        throw new Error(
          `Error fetching client account: ${clientAccountError?.message ?? 'No organization found'}`,
        );
      }
      clientOrganizationId = clientAccount.organization_id;
    } else if (!organizationId && !clientId) {
      throw new Error('Either clientId or organizationId must be provided');
    }

    // Fetch the agency details for permission validation
    const agencyAccount = await getAgencyForClient(clientOrganizationId ?? '');
    if (!agencyAccount) {
      throw new Error('Error fetching agency account');
    }
    const agencyOrganizationId = agencyAccount.id;

    // Step 2: Check if the user has permission to delete
    const hasPermission = await hasPermissionToDeleteClient(
      agencyOrganizationId,
      clientOrganizationId ?? '',
      clientId,
    );
    if (!hasPermission) {
      throw new CustomError(
        HttpStatus.Error.Unauthorized,
        'You do not have permission to delete this client or organization',
        ErrorClientOperations.INSUFFICIENT_PERMISSIONS,
      );
    }

    // Step 3: Proceed with deletion based on the provided parameters
    if (clientId && !organizationId) {
      // Delete a specific client
      const { error: deleteError } = await client
        .from('clients')
        .update({
          deleted_on: new Date().toISOString(),
        })
        .eq('user_client_id', clientId)
        .eq('agency_id', agencyOrganizationId);

      if (deleteError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error deleting the client: ${deleteError.message}`,
          ErrorUserOperations.FAILED_TO_DELETE_USER,
        );
      }

      // Remove the client as follower from assigned orders for that agency
      const { error: followersError } = await client
        .from('order_followers')
        .delete()
        .eq('client_member_id', clientId);

      if (followersError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error removing follower from assigned order`,
          ErrorOrderOperations.FAILED_TO_REMOVE_FOLLOWER,
        );
      }
    } else if (organizationId) {
      // Delete all clients in the organization
      const { error: deleteClientsError } = await client
        .from('clients')
        .update({
          deleted_on: new Date().toISOString(),
        })
        .eq('organization_client_id', organizationId)
        .eq('agency_id', agencyOrganizationId);

      if (deleteClientsError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error deleting clients in the organization: ${deleteClientsError.message}`,
          ErrorUserOperations.FAILED_TO_DELETE_USERS,
        );
      }

      // Remove all client members as followers from their assigned orders
      const { error: followersError } = await client
        .from('order_followers')
        .delete()
        .in(
          'client_member_id',
          await client
            .from('clients')
            .select('user_client_id')
            .eq('organization_id', organizationId)
            .then(
              (res) => res.data?.map((client) => client.user_client_id) ?? [],
            ),
        );

      if (followersError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error removing clients as followers from assigned orders: ${followersError.message}`,
          ErrorOrderOperations.FAILED_TO_REMOVE_FOLLOWERS,
        );
      }
    }
    return CustomResponse.success(null, ErrorClientOperations.CLIENT_DELETED).toJSON();
  } catch (error) {
    console.error('Error deleting client or organization:', error);
    return CustomResponse.error(error).toJSON();
  }
};
