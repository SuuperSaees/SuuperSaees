'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const createOrganizationServer = async (clientData: {
  organization_name: string;
}) => {
  try {
    const client = getSupabaseServerComponentClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const newAccount = {
      name: clientData.organization_name,
      primary_owner_user_id: user.id,
      is_personal_account: false,
    };

    const { data: OrganizationAccountData, error: OrganizationAccountError } =
      await client.from('accounts').insert(newAccount).select().single();

    if (OrganizationAccountError) {
      throw new Error(OrganizationAccountError.message);
    }
    console.log('ORGANIZATION CREATED')
    // associate user
    const { data: updatedUserOwnerAccount, error: updatedUserOwnerAccountError } =
      await client
        .from('accounts')
        .update({ organization_id: OrganizationAccountData.id })
        .eq('id', user.id)
        .select()
        .single();

    if(updatedUserOwnerAccountError) throw new Error(updatedUserOwnerAccountError.message)
    return updatedUserOwnerAccount;
    
  } catch (error) {
    console.error('Error while creating the organization account:', error);
  }
};