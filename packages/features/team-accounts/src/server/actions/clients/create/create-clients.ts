'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import type { Client } from '../../../../../../../../apps/web/lib/client.types';
import {
  CustomError,
  CustomResponse,
  ErrorClientOperations,
  ErrorOrganizationOperations,
  ErrorUserOperations,
  JSONCustomResponse,
} from '../../../../../../../../packages/shared/src/response';
import { addUserAccountRole } from '../../members/create/create-account';
import {
  getUserAccountByEmail,
} from '../../members/get/get-member-account';
import { insertOrganization } from '../../organizations/create/create-organization-server';
import {
  getAgencyForClient,
  getOrganization,
  getOrganizationById,
} from '../../organizations/get/get-organizations';
import {
  hasPermissionToAddClientMembers,
  hasPermissionToCreateClientOrg,
} from '../../permissions/clients';
import { createClientUserAccount } from './services/create-client-account.service';
import { insertClient } from './services/insert-client.service';
import { CreateClient } from './create-client.types';
import { reactivateDeletedClient } from './utils/client-reactivation.utils';
import { revalidatePath } from 'next/cache';

/**
 * @prop {adminActivated}: This is a boolean that indicates if the client is being created by an admin user.
 * @prop {agencyId}: This is the id of the agency that the client is being created for.
 *
 */

export const createClient = async (clientData: CreateClient) => {
  // Refactor this function to use the new client data structure
  try {

    // Step 0: Check if user was previously deleted and reactivate if needed
    const supabase = getSupabaseServerComponentClient({ admin: clientData.adminActivated ?? false });
    
    // First get the account id for this email
    const { data: accountData } = await supabase
      .from('accounts')
      .select('id')
      .eq('email', clientData.client.email)
      .single();

      const agencyIdForReactivation = !clientData.adminActivated ? (await supabase.rpc('get_current_organization_id')).data : clientData.agencyId;

      if (accountData?.id) {
        // Now check if this account was a deleted client
        const { data: existingClient } = await supabase
          .from('clients')
          .select('*')
          .eq('user_client_id', accountData.id)
          .eq('agency_id', agencyIdForReactivation ?? '')
          .single();
  
        if (existingClient?.deleted_on) {
          await reactivateDeletedClient({
            accountId: accountData.id,
            email: clientData.client.email,
            name: clientData.client.name,
            slug: clientData.client.slug,
            baseUrl: clientData.baseUrl,
            supabase: undefined,
            adminActivated: true,
            agencyId: agencyIdForReactivation ?? '',
          });
          
          return CustomResponse.success(existingClient, 'clientCreated').toJSON();
        } else if(!existingClient) {
          await reactivateDeletedClient({
            accountId: accountData.id,
            email: clientData.client.email,
            name: clientData.client.name,
            slug: clientData.client.slug,
            baseUrl: clientData.baseUrl,
            supabase: undefined,
            adminActivated: true,
            agencyId: agencyIdForReactivation ?? '',
            newAgency: true,
          })

          return CustomResponse.success(existingClient, 'clientCreated').toJSON();
        

        }
      }

    // Step 1: Fetch primary owner ID and organization

    const organization = !clientData.agencyId
      ? await getOrganization()
      : await getOrganizationById(
          clientData.agencyId,
          undefined,
          clientData.adminActivated,
        );

    if (!organization)
      throw new CustomError(
        404,
        'No agency found',
        ErrorOrganizationOperations.ORGANIZATION_NOT_FOUND,
      );

    // Step 2: Check if the user has permission to create a client
    if (!clientData.adminActivated) {
      const hasPermission = await hasPermissionToCreateClientOrg(
        organization.id,
      );
      if (!hasPermission) {
        throw new CustomError(
          403,
          'You do not have the required permissions to create a client',
          ErrorClientOperations.INSUFFICIENT_PERMISSIONS,
        );
      }
    }

    // Step 3: Create or fetch the client organization user account
    const clientOrganizationUser = await createClientUserAccount(
      clientData.client.email,
      clientData.client.name,
      organization.name ?? '',
      clientData.adminActivated,
      clientData.agencyId,
      clientData.sendEmail,
    );

    const userId = clientOrganizationUser.user?.id;
    if (!userId) throw new Error('No user id provided');

    // Step 4: Verify if the client organization account already exists
    const clientAccountData = await getUserAccountByEmail(
      clientData.client.email,
      undefined,
      clientData.adminActivated,
    );

    // Step 5: Retrieve or create the client organization
    const clientOrganizationAccount = clientAccountData?.organization_id
      ? await getOrganizationById(clientAccountData.organization_id)
      : await insertOrganization(
          { name: clientData.client.slug },
          userId,
          undefined,
          clientData.adminActivated,
        );

    if (!clientOrganizationAccount)
      throw new CustomError(
        404,
        'No organization found for this client',
        ErrorOrganizationOperations.ORGANIZATION_NOT_FOUND,
      );

    // Step 6: Add role to the accounts_memberships
    await addUserAccountRole(
      clientOrganizationAccount.id,
      userId,
      clientData.role,
      undefined,
      clientData.adminActivated,
    );

    // Step 7: Insert client into the clients table
    const client = await insertClient(
      organization.id,
      userId,
      clientOrganizationAccount.id,
      undefined,
      clientData.adminActivated,
    );

    revalidatePath('/clients');

    if (clientData.sendEmail) {
      return CustomResponse.success(client, 'clientCreated').toJSON();
    } else {
      return CustomResponse.success({
        ...client,
        session: clientOrganizationUser.session,
      }, 'clientCreated').toJSON();
    }
  } catch (error) {
    console.error('Error creating the client:', error);
    return CustomResponse.error(error).toJSON();
  }
};

export const addClientMember = async ({
  email,
  clientOrganizationId,
  baseUrl,
}: {
  email: string;
  clientOrganizationId: string;
  baseUrl?: string;
}): Promise<JSONCustomResponse<Client.Insert | null>> => {
  try {
    const supabase = getSupabaseServerComponentClient();
    const userRole = 'client_member';

    // Step 1: Get the client's organization
    const clientOrganization = await getOrganizationById(clientOrganizationId);
    if (!clientOrganization) {
      throw new CustomError(
        404,
        'Client organization not found',
        ErrorOrganizationOperations.ORGANIZATION_NOT_FOUND,
      );
    }

    // Step 2: Get the agency organization assigned to the client
    const agencyOrganization = await getAgencyForClient();
    if (!agencyOrganization) {
      throw new CustomError(
        404,
        `No agency found for organization ID ${clientOrganizationId}`,

        ErrorClientOperations.AGENCY_NOT_FOUND,
      );
    }

    // Step 3: Ensure the current user has the necessary permission to perform the action
    const hasPermissionToAdd = await hasPermissionToAddClientMembers(
      agencyOrganization.id,
      clientOrganizationId,
    );

    if (!hasPermissionToAdd) {
      throw new CustomError(
        403,
        'Unauthorized: Insufficient permissions',
        ErrorClientOperations.INSUFFICIENT_PERMISSIONS,
      );
    }

    // Step 4: Check if the client already exists
    const clientAccountData = await getUserAccountByEmail(email);
    if (clientAccountData) {
      // throw new Error('Client already exists');
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('user_client_id', clientAccountData.id ?? '')
        .not('deleted_on', 'is', null)
        .single();

      if (existingClient) {
        await reactivateDeletedClient({
          accountId: clientAccountData.id ?? '',
          email,
          name: '',
          slug: '',
          baseUrl,
          supabase: undefined,
          adminActivated: true,
          clientOrganizationId,
        });

        return CustomResponse.success(existingClient, 'clientCreated').toJSON();
      }
    }

    // Step 5: Create the new client user account
    const clientOrganizationUser = await createClientUserAccount(
      email,
      '',
      clientOrganization.name ?? '',
    );
    const clientUserId = clientOrganizationUser.user?.id;
    if (!clientUserId) {
      throw new CustomError(
        409,
        'Failed to create client user account',
        ErrorUserOperations.FAILED_TO_CREATE_USER,
      );
    }

    // Step 6: Assign the new user as part of the agency's clients
    const client = await insertClient(
      agencyOrganization.id,
      clientUserId,
      clientOrganizationId,
      supabase,
    );

    // Step 7: Add the user role as client into the accounts_memberships table
    await addUserAccountRole(
      clientOrganizationId,
      clientUserId,
      userRole,
      supabase,
    );

    revalidatePath('/clients');
    // return client;
    return CustomResponse.success(client, 'memberAdded').toJSON();
  } catch (error) {
    console.error('Error creating the client v2:', error);
    return CustomResponse.error(error).toJSON();
  }
};
