'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import type { Client } from '../../../../../../../../apps/web/lib/client.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { OrganizationSettings as OrganizationSettingsType } from '../../../../../../../../apps/web/lib/organization-settings.types';
import { Tokens } from '../../../../../../../../apps/web/lib/tokens.types';
import {
  CustomError,
  CustomResponse,
  ErrorClientOperations,
  ErrorOrganizationOperations,
  ErrorUserOperations,
  JSONCustomResponse,
} from '../../../../../../../../packages/shared/src/response';
import { decodeToken } from '../../../../../../../../packages/tokens/src/decode-token';
import {
  getDomainByOrganizationId,
  getDomainByUserId,
} from '../../../../../../../multitenancy/utils/get/get-domain';
import {
  generateRandomPassword,
  getTextColorBasedOnBackground,
} from '../../../utils/generate-colors';
import { addUserAccountRole } from '../../members/create/create-account';
import {
  getPrimaryOwnerId,
  getUserAccountByEmail,
} from '../../members/get/get-member-account';
import { fetchCurrentUser } from '../../members/get/get-member-account';
import { updateUserAccount } from '../../members/update/update-account';
import { insertOrganization } from '../../organizations/create/create-organization-server';
import {
  getAgencyForClient,
  getOrganization,
  getOrganizationById,
  getOrganizationSettings,
  getOrganizationSettingsByOrganizationId,
} from '../../organizations/get/get-organizations';
import {
  hasPermissionToAddClientMembers,
  hasPermissionToCreateClientOrg,
} from '../../permissions/clients';
// import { getSubscriptionByOrganizationId } from '../../subscriptions/get/get-subscription';
import { sendClientConfirmEmail } from '../send-email/send-client-email';

// Define la función createClient
type CreateClient = {
  client: {
    email: string;
    slug: string;
    name: string;
  };
  role: string;
  agencyId?: string;
  adminActivated?: boolean;
};

const createClientUserAccount = async (
  clientEmail: string,
  organizationName: Account.Type['name'],
  adminActivated = false,
  agencyId?: string,
) => {
  try {
    const client = getSupabaseServerComponentClient({
      admin: adminActivated,
    });
    let baseUrl, organizationId;
    if (!adminActivated) {
      const userData = await fetchCurrentUser(client);
      const userId = userData?.id;
      if (!userId) throw new Error('No user id provided');
      const { domain: baseUrlValue, organizationId: organizationIdValue } =
        await getDomainByUserId(userId, true);
      baseUrl = baseUrlValue;
      organizationId = organizationIdValue;
    } else {
      baseUrl = await getDomainByOrganizationId(agencyId ?? '', true, true);
      organizationId = agencyId ?? '';
    }

    // Step 1: Pre-authentication of the user
    const password = generateRandomPassword(12);

    const { logo_url, theme_color } = OrganizationSettingsType.KEYS;

    const { default_sender_logo, default_sender_color } =
      OrganizationSettingsType.EXTRA_KEYS;
    let organizationLogo: {
        key: string;
        value: string;
      } | null = null,
      organizationColor: {
        key: string;
        value: string;
      } | null = null;

    if (!adminActivated) {
      const organizationSettings = await getOrganizationSettings();

      organizationSettings.forEach((setting) => {
        if (setting.key === logo_url && setting.value !== '')
          organizationLogo = { key: logo_url, value: setting.value };
        if (setting.key === theme_color && setting.value !== '')
          organizationColor = { key: theme_color, value: setting.value };
      });
    } else {
      const organizationSettings =
        await getOrganizationSettingsByOrganizationId(
          organizationId,
          adminActivated,
          [logo_url, theme_color],
        );

      organizationSettings.forEach((setting) => {
        if (setting.key === logo_url && setting.value !== '')
          organizationLogo = { key: logo_url, value: setting.value };
        if (setting.key === theme_color && setting.value !== '')
          organizationColor = { key: theme_color, value: setting.value };
      });
    }

    organizationLogo = organizationLogo ?? {
      key: logo_url,
      value: default_sender_logo,
    };

    organizationColor = organizationColor ?? {
      key: theme_color,
      value: default_sender_color,
    };

    // Step 2: Sign up the user
    const { data: clientOrganizationUser, error: clientOrganizationUserError } =
      await client.auth.signUp({
        email: clientEmail ?? '',
        password,
        // options: { IMPORTANT: We need to disable this to avoid the email confirmation flow
        //   emailRedirectTo: `${baseUrl}set-password`,
        //   data: {
        //     ClientContent: 'Hi',
        //     ClientContent1: 'Welcome to ',
        //     ClientContent2: organizationName,
        //     ClientContent3: ', please activate your account to get started.',
        //     ClientContent4: 'Your username:',
        //     ClientContent5: 'Thanks,',
        //     ClientContent6: 'The Team',
        //     OrganizationSenderLogo: organizationLogo.value,
        //     OrganizationSenderColor: organizationColor.value,
        //     ButtonTextColor:
        //       getTextColorBasedOnBackground(organizationColor?.value) ??
        //       '#ffffff',
        //   },
        // },
      });

    if (clientOrganizationUserError) {
      console.error(
        'Error occurred while creating the client user. Authentication error',
      );
      throw new CustomError(
        401,
        'Authentication error',
        ErrorUserOperations.USER_ALREADY_EXISTS,
      );
    }
    // Step 3: Take the object session and decode the access_token as jwt to get the session id
    const sessionUserClient = clientOrganizationUser.session;
    const createdAtAndUpdatedAt = new Date().toISOString();
    const accessToken = sessionUserClient?.access_token ?? '';
    const refreshToken = sessionUserClient?.refresh_token ?? '';
    const expiresAt = new Date(
      new Date().getTime() + 3600 * 1000,
    ).toISOString();
    const providerToken = 'supabase';
    const sessionId = decodeToken(accessToken, 'base64')?.session_id as string;
    const callbackUrl = `${baseUrl}set-password`;
    // Step 4: Save the token in the database
    const token: Tokens.Insert = {
      id: sessionId,
      id_token_provider: sessionId,
      created_at: createdAtAndUpdatedAt,
      updated_at: createdAtAndUpdatedAt,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      provider: providerToken,
    };

    const { error: tokenError } = await client.from('tokens').insert(token);

    if (tokenError) {
      console.error('Error occurred while saving the token', tokenError);
      throw new Error('Error occurred while saving the token');
    }
    // Step 5: Send the email with the magic link
    await sendClientConfirmEmail(
      baseUrl,
      clientEmail,
      organizationLogo.value,
      organizationColor.value,
      getTextColorBasedOnBackground(organizationColor.value),
      sessionId,
      callbackUrl,
      organizationName,
      organizationId,
    );
    // Step 6: Return the client organization user
    return clientOrganizationUser;
  } catch (error) {
    console.error('Error occurred while creating the client user');
    throw error;
  }
};

export const insertClient = async (
  agencyId: Client.Insert['agency_id'],
  userId: Client.Insert['user_client_id'],
  organizationId: Client.Insert['organization_client_id'],
  supabaseClient?: SupabaseClient<Database>,
  adminActivated = false,
): Promise<Client.Insert> => {
  supabaseClient =
    supabaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {
    const { data: clientData, error: clientError } = await supabaseClient
      .from('clients')
      .insert({
        agency_id: agencyId,
        user_client_id: userId,
        organization_client_id: organizationId,
      })
      .select()
      .single();
    
    //Create user_settings row for the user
    const {data: clientSettings, error: clientSettingsError} = await supabaseClient
      .from('user_settings')
      .insert({
        user_id: userId
      })

    if (clientError) {
      console.error('Error inserting client', clientError.message);
      throw new Error(`Error inserting client: ${clientError.message}`);
    }else if(clientSettingsError) {
      console.error('Error inserting client settings', clientSettingsError.message);
      throw new Error(`Error inserting client settings: ${clientSettingsError.message}`);
    }

    return clientData;
  } catch (error) {
    console.error('Error inserting client', error);
    throw error;
  }
};

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

    if (accountData?.id) {
      // Now check if this account was a deleted client
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('user_client_id', accountData.id)
        .not('deleted_on', 'is', null)
        .single();

      if (existingClient) {
        // Reactivate the client by setting deleted_on to null
        const { error: reactivateError } = await supabase
          .from('clients')
          .update({ deleted_on: null })
          .eq('user_client_id', accountData.id);

        if (reactivateError) {
          throw new Error(`Error reactivating client: ${reactivateError.message}`);
        }
        return CustomResponse.success(existingClient, 'clientCreated').toJSON();
      }
    }

    // Step 1: Fetch primary owner ID and organization
    let primaryOwnerId;
    if (!clientData.adminActivated) {
      primaryOwnerId = await getPrimaryOwnerId();
    }

    const organization = !clientData.agencyId
      ? await getOrganization()
      : await getOrganizationById(
          clientData.agencyId,
          undefined,
          clientData.adminActivated,
        );

    if (!primaryOwnerId && !clientData.adminActivated)
      throw new Error('No primary owner user id found');

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
      organization.name,
      clientData.adminActivated,
      clientData.agencyId,
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

    // Step 8: Update client user with organization ID
    await updateUserAccount(
      {
        organization_id: clientOrganizationAccount.id,
        name: clientData.client.name,
      },
      userId,
      undefined,
      clientData.adminActivated,
    );

    return CustomResponse.success(client, 'clientCreated').toJSON();
  } catch (error) {
    console.error('Error creating the client:', error);
    return CustomResponse.error(error).toJSON();
  }
};

export const addClientMember = async ({
  email,
  clientOrganizationId,
}: {
  email: string;
  clientOrganizationId: string;
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
    const agencyOrganization = await getAgencyForClient(clientOrganizationId);
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
      throw new CustomError(
        409,
        'Client already exists',
        ErrorUserOperations.USER_ALREADY_EXISTS,
      );
    }

    // Step 5: Create the new client user account
    const clientOrganizationUser = await createClientUserAccount(
      email,
      clientOrganization.name,
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

    // Step 8: Update the new user client account with its respective organization ID
    await updateUserAccount(
      { organization_id: clientOrganization.id },
      clientUserId,
      supabase,
    );

    // return client;
    return CustomResponse.success(client, 'memberAdded').toJSON();
  } catch (error) {
    console.error('Error creating the client v2:', error);
    return CustomResponse.error(error).toJSON();
  }
};
