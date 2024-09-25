'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { getUserAccountById } from '../../members/get/get-member-account';
import { updateUserAccount } from '../../members/update/update-account';

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
    const userAccount = await getUserAccountById(client, user.id);

    // Prevent creation if an organization already exists
    if (userAccount?.organization_id) {
      throw new Error('This account already has an organization associated.');
    }

    // Create a new organization account
    const newAccount = {
      name: clientData.organization_name,
    };

    const organizationAccountData = await insertOrganization(
      client,
      newAccount,
      user.id,
    );

    // Associate the new organization with the user
    await updateUserAccount(
      client,
      {
        organization_id: organizationAccountData.id,
      },
      user.id,
    );

    return organizationAccountData;
  } catch (error) {
    console.error('Error while creating the organization account:', error);
    throw error; // Throw the error to ensure the caller knows the function failed
  }
};

export const insertOrganization = async (
  databaseClient: SupabaseClient<Database>,
  organizationData: Account.Insert,
  ownerId: Account.Type['id'],
) => {
  try {
    const newAccount = {
      ...organizationData,
      primary_owner_user_id: ownerId,
      is_personal_account: false,
    };

    const { data: organization, error: organizationError } =
      await databaseClient
        .from('accounts')
        .insert(newAccount)
        .select()
        .single();

    if (organizationError) {
      throw new Error(
        `Error creating the organization: ${organizationError.message}`,
      );
    }

    return organization;
  } catch (error) {
    console.error('Error while inserting the organization:', error);
    throw error; // Throw the error to ensure the caller knows the function failed
  }
};