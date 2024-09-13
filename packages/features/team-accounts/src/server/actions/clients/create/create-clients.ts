'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { User } from '../../../../../../../../apps/web/lib/user.types';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';
import { getOrganization } from '../../organizations/get/get-organizations';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Define la función createClient
type CreateClient = {
  client: User.Insert;
  role: string;
  selectedOrganizationId?: string;
};

function generateRandomPassword(length: number) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

const createClientUserAccount = async (
  clientData: CreateClient,
  organization: Database['public']['Tables']['accounts']['Row'],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const organization_name = organization.name;

    // pre-authentication of the user
    const password = generateRandomPassword(12);

    const { data: clientOrganizationUser, error: clientOrganizationUserError } =
      await client.auth.signUp({
        email: clientData.client.email ?? '',
        password,
        options: {
          emailRedirectTo: `${baseUrl}set-password`,
          data: {
            ClientContent: 'Hi',
            ClientContent1: 'Welcome to ',
            ClientContent2: organization_name,
            ClientContent3: ', please activate your account to get started.',
            ClientContent4: 'Your username:',
            ClientContent5: 'Thanks,',
            ClientContent6: 'The Team',
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

export const createClient = async (clientData: CreateClient) => {
  try {
    const supabase = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId();
    const organization = await getOrganization();

    if (!primary_owner_user_id)
      throw new Error('No primary owner user id found');

    if (!organization) throw new Error('No organization found');

    const clientOrganizationUser = await createClientUserAccount(
      clientData,
      organization,
    );

    // Verify if the client organization account already exist
    const { data: clientOrganizationExists } = await supabase
      .from('accounts')
      .select()
      .eq('name', clientData.client.slug ?? '')
      .single();

    let clientOrganizationAccount;

    if (!clientOrganizationExists) {
      const { data, error: clientAccountError } = await supabase
        .from('accounts')
        .insert({
          name: clientData.client.slug ?? '',
          is_personal_account: false,
          primary_owner_user_id: clientOrganizationUser.user?.id,
        })
        .select()
        .single();

      if (clientAccountError) {
        throw new Error(clientAccountError.message);
      }
      clientOrganizationAccount = data;
    } else {
      clientOrganizationAccount = clientOrganizationExists;
    }

    const { error: accountRoleError } = await supabase
      .from('accounts_memberships')
      .insert({
        account_id: clientOrganizationAccount.id,
        user_id: clientOrganizationUser.user!.id,
        account_role: clientData.role,
      });

    if (accountRoleError) throw new Error(accountRoleError.message);
    // nest client into clients table
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        agency_id: organization?.id ?? '',
        user_client_id: clientOrganizationUser.user?.id ?? '',
        organization_client_id: clientOrganizationAccount.id,
      })
      .select()
      .single();

    // update clientUser with organization id
    const { error: errorUpdateClientUser } = await supabase
      .from('accounts')
      .update({
        organization_id: clientOrganizationAccount.id,
      })
      .eq('primary_owner_user_id', clientOrganizationUser.user?.id ?? '')
      .eq('is_personal_account', true);

    if (errorUpdateClientUser)
      throw new Error('Error updating the user client');

    if (clientError) {
      throw new Error(clientError.message);
    }
    return client;
  } catch (error) {
    console.error('Error al crear el cliente:', error);
  }
};
