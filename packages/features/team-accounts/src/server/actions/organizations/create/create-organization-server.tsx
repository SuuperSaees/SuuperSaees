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
      throw new Error('Error to get user account');
    }

    const {data: userAccount, error: userAccountError} = await client
    .from('accounts')
    .select("organization_id")
    .eq('id', user.id)
    .single()

    if(userAccountError) {
      throw new Error(userAccountError.message)
    }
      // upsert - create o change organization name
      let organizationAccountData;
      let organizationAccountError;
      if(userAccount.organization_id) {
        const { data, error } = await client
        .from('accounts')
        .update({ name: clientData.organization_name })
        .select()
        .single();
    
      organizationAccountData = data;
      organizationAccountError = error;
      } else {
        const newAccount = {
          name: clientData.organization_name,
          primary_owner_user_id: user.id,
          is_personal_account: false,
        };
      
        const { data, error } = await client
          .from('accounts')
          .insert(newAccount)
          .select()
          .single();
      
        organizationAccountData = data;
        organizationAccountError = error;
      }

    if (organizationAccountError) {
      throw new Error(organizationAccountError.message);
    }
    // associate user
    const { data: updatedUserOwnerAccount, error: updatedUserOwnerAccountError } =
      await client
        .from('accounts')
        .update({ organization_id: organizationAccountData?.id })
        .eq('id', user.id)
        .select()
        .single();

    if(updatedUserOwnerAccountError) throw new Error(updatedUserOwnerAccountError.message)
    return updatedUserOwnerAccount;
    
  } catch (error) {
    console.error('Error while creating the organization account:', error);
  }
};