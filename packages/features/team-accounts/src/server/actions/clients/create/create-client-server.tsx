'use server';

// import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { User } from '../../../../../../../../apps/web/lib/user.types';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';


// Define la función createClient
type CreateClient = {
  client: User.Insert;
  role: string;
};
export const createClient = async (clientData: CreateClient) => {
  try {
    const supabase = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId();

    if (!primary_owner_user_id)
      throw new Error('No primary owner user id found');
    // pre-authentication of the user
    const { data: clientOrganizationUser, error: clientOrganizationUserError } =
      await supabase.auth.signUp({
        email: clientData.client.email ?? '',
        password: 'anyDDA',
      });

      
    if (clientOrganizationUserError) {
      throw new Error(clientOrganizationUserError.message);
    }

    const {data: clientOrganizationExists } = await supabase
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
      clientOrganizationAccount =
        clientOrganizationExists ;
    }

    const { error: accountRoleError } = await supabase
      .from('accounts_memberships')
      .insert({
        account_id: primary_owner_user_id,
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
      const {error: errorUpdateClientUser } = await supabase.from('accounts').update(
        {
          organization_id: clientOrganizationAccount.primary_owner_user_id,
        }
        ).eq('primary_owner_user_id', clientOrganizationUser.user?.id ?? '').eq('is_personal_account', true);
      
        if (errorUpdateClientUser) throw new Error('Error updating the user client');

    if (clientError) {
      throw new Error(clientError.message);
    }
    return client;
  } catch (error) {
    console.error('Error al crear el cliente:', error);
  }
};