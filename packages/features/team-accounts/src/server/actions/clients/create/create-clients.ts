'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import type { Client } from '../../../../../../../../apps/web/lib/client.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import {
  generateRandomPassword, // getTextColorBasedOnBackground
} from '../../../utils/generate-colors';
import { addUserAccountRole } from '../../members/create/create-account';
import {
  getPrimaryOwnerId,
  getUserAccountByEmail,
} from '../../members/get/get-member-account';
import { updateUserAccount } from '../../members/update/update-account';
import { insertOrganization } from '../../organizations/create/create-organization-server';
import {
  getAgencyForClient,
  getOrganization, // getOrganizationSettings,
  getOrganizationById,
} from '../../organizations/get/get-organizations';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Define la función createClient
type CreateClient = {
  client: {
    email: string;
    slug: string;
  };
  role: string;
  selectedOrganizationId?: string;
};

const createClientUserAccount = async (
  clientEmail: string,
  organizationName: Account.Type['name'],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    // const organizationSettings = await getOrganizationSettings();

    // pre-authentication of the user
    const password = generateRandomPassword(12);

    // const organizationLogo = organizationSettings.find(
    //   (setting) => setting.key === 'logo_url',
    // );

    // const organizationColor = organizationSettings.find(
    //   (setting) => setting.key === 'theme_color',
    // );

    const { data: clientOrganizationUser, error: clientOrganizationUserError } =
      await client.auth.signUp({
        email: clientEmail ?? '',
        password,
        options: {
          emailRedirectTo: `${baseUrl}set-password`,
          data: {
            ClientContent: 'Hi',
            ClientContent1: 'Welcome to ',
            ClientContent2: organizationName,
            ClientContent3: ', please activate your account to get started.',
            ClientContent4: 'Your username:',
            ClientContent5: 'Thanks,',
            ClientContent6: 'The Team',
            // OrganizationSenderLogo: organizationLogo?.value ?? '',
            // OrganizationSenderColor: organizationColor?.value ?? '',
            // ButtonTextColor: organizationColor
            //   ? getTextColorBasedOnBackground(organizationColor.value)
            //   : '',
          },
        },
      });

    if (clientOrganizationUserError) {
      console.error('Error occurred while creating the client user');
      throw new Error(clientOrganizationUserError.message);
    }

    return clientOrganizationUser;
  } catch (error) {
    console.error('Error occurred while creating the client user');
    throw error;
  }
};

export const insertClient = async (
  supabaseClient: SupabaseClient<Database>,
  agencyId: Client.Insert['agency_id'],
  userId: Client.Insert['user_client_id'],
  organizationId: Client.Insert['organization_client_id'],
): Promise<Client.Insert> => {
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

    if (clientError) {
      console.error('Error inserting client', clientError.message);
      throw new Error(`Error inserting client: ${clientError.message}`);
    }

    return clientData;
  } catch (error) {
    console.error('Error inserting client', error);
    throw error;
  }
};

export const createClient = async (clientData: CreateClient) => {
  try {
    const supabase = getSupabaseServerComponentClient();
    const primaryOwnerId = await getPrimaryOwnerId();
    const organization = await getOrganization();

    if (!primaryOwnerId) throw new Error('No primary owner user id found');
    if (!organization) throw new Error('No organization found');

    // Create or fetch the client organization user account
    const clientOrganizationUser = await createClientUserAccount(
      clientData.client.email,
      organization.name,
    );
    const userId = clientOrganizationUser.user?.id;
    if (!userId) throw new Error('No user id provided');

    // Verify if the client organization account already exists
    const clientAccountData = await getUserAccountByEmail(
      supabase,
      clientData.client.email,
    );

    // Retrieve or create the client organization
    const clientOrganizationAccount = clientAccountData?.organization_id
      ? await getOrganizationById(clientAccountData.organization_id)
      : await insertOrganization(
          supabase,
          { name: clientData.client.slug },
          userId,
        );

    if (!clientOrganizationAccount) throw new Error('No organization found');

    // Add role to the accounts_memberships
    await addUserAccountRole(
      supabase,
      clientOrganizationAccount.id,
      userId,
      clientData.role,
    );

    // Nest client into clients table
    const client = await insertClient(
      supabase,
      organization.id,
      userId,
      clientOrganizationAccount.id,
    );

    // Update clientUser with organization ID
    await updateUserAccount(
      supabase,
      { organization_id: clientOrganizationAccount.id },
      userId,
    );

    return client;
  } catch (error) {
    console.error('Error creating the client', error);
    throw error;
  }
};

export const addClientMember = async ({
  email,
  clientOrganizationId,
}: {
  email: string;
  clientOrganizationId: string;
}): Promise<Client.Insert> => {
  try {
    const supabase = getSupabaseServerComponentClient();
    const userRole = 'client_member';

    // Get the client's organization
    const clientOrganization = await getOrganizationById(clientOrganizationId);

    if (!clientOrganization) {
      console.error('No organization found');
      throw new Error('No organization found');
    }

    // Get agency organization assigned to the client
    const agencyOrganization = await getAgencyForClient(clientOrganizationId);

    if (!agencyOrganization) {
      throw new Error(
        `No agency found for organization id ${clientOrganizationId}`,
      );
    }

    // Verify the existence of the client on any other agency
    const clientAccountData = await getUserAccountByEmail(supabase, email);
    if (clientAccountData) throw new Error('Client already exists');

    // Create the new client user account
    const clientOrganizationUser = await createClientUserAccount(
      email,
      clientOrganization.name,
    );
    const clientUserId = clientOrganizationUser.user?.id;
    if (!clientUserId) {
      throw new Error('Failed to create client user account');
    }

    // Assign the new user as part of the agency's clients
    const client = await insertClient(
      supabase,
      agencyOrganization.id,
      clientUserId,
      clientOrganizationId,
    );

    // Add its role as client into the accounts_memberships
    await addUserAccountRole(
      supabase,
      clientOrganizationId,
      clientUserId,
      userRole,
    );

    // Update the new user client account with its respective organizatio_id
    await updateUserAccount(
      supabase,
      {
        organization_id: clientOrganization.id,
      },
      clientUserId,
    );

    return client;
  } catch (error) {
    console.error('Error creating the client', error);
    throw error;
  }
};