'use server';

// import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { User } from '../../../../../../../../apps/web/lib/user.types';
import {
  getOrganizationName,
  getPrimaryOwnerId,
} from '../../members/get/get-member-account';
import { getOrganizationSettings } from '../../organizations/get/get-organizations';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

console.log('Base URL:', baseUrl);

// Define la función createClient
type CreateClient = {
  client: User.Insert;
  role: string;
};

function getTextColorBasedOnBackground(backgroundColor: string) {
  // Remove any hash symbol if it exists
  const color = backgroundColor.replace('#', '');

  // Convert the hex color to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate the luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Return 'black' for lighter backgrounds and 'white' for darker backgrounds
  return luminance > 186 ? 'black' : 'white'; // 186 is a common threshold for readability
}

function generateRandomPassword(length: number) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export const createClient = async (clientData: CreateClient) => {
  try {
    const supabase = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId();
    const organization_name = await getOrganizationName();
    const organizationSettings = await getOrganizationSettings();
    if (!primary_owner_user_id)
      throw new Error('No primary owner user id found');
    // pre-authentication of the user
    const password = generateRandomPassword(12);
    const organizationLogo = organizationSettings.find(
      (setting) => setting.key === 'logo_url',
    );
    const organizationColor = organizationSettings.find(
      (setting) => setting.key === 'theme_color',
    );

    const { data: clientOrganizationUser, error: clientOrganizationUserError } =
      await supabase.auth.signUp({
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
            OrganizationSenderLogo: organizationLogo?.value ?? '',
            OrganizationSenderColor: organizationColor?.value ?? '',
            ButtonTextColor: organizationColor
              ? getTextColorBasedOnBackground(organizationColor.value)
              : '',
          },
        },
      });

    if (clientOrganizationUserError) {
      throw new Error(clientOrganizationUserError.message);
    }

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
        agency_id: primary_owner_user_id,
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