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

    // Fetch the user's account to check for an existing organization
    const { data: userAccount, error: userAccountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userAccountError) {
      throw new Error(userAccountError.message);
    }

    // Prevent creation if an organization already exists
    if (userAccount.organization_id) {
      throw new Error('This account already has an organization associated.');
    }

    // Create a new organization account
    const newAccount = {
      name: clientData.organization_name,
      primary_owner_user_id: user.id,
      is_personal_account: false,
    };

    const { data: organizationAccountData, error: organizationAccountError } =
      await client.from('accounts').insert(newAccount).select().single();

    if (organizationAccountError) {
      throw new Error(organizationAccountError.message);
    }

    // Associate the new organization with the user
    const { error: updatedUserOwnerAccountError } = await client
      .from('accounts')
      .update({ organization_id: organizationAccountData?.id })
      .eq('id', user.id)
      .select()
      .single();

    if (updatedUserOwnerAccountError) {
      throw new Error(updatedUserOwnerAccountError.message);
    }

    return organizationAccountData;
  } catch (error) {
    console.error('Error while creating the organization account:', error);
    throw error;  // Throw the error to ensure the caller knows the function failed
  }
};