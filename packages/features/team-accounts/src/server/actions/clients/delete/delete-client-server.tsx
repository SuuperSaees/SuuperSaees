'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


// Define la función handleDelete
export const deleteClient = async (clientId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const allowedRolesToDeleteMembers = ['agency_owner', 'client_owner'];

    // Get current user data
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(`Error fetching user: ${userError.message}`);

    // Get the current user's account details
    const { data: currentUserAccount, error: currentAccountError } =
      await client
        .from('accounts')
        .select('organization_id, id')
        .eq('id', userData.user.id)
        .single();

    if (currentAccountError)
      throw new Error(
        `Error fetching user account: ${currentAccountError.message}`,
      );
    if (!currentUserAccount?.organization_id) {
      throw new Error('Error fetching user account');
    }

    const { data: currentUserAccountRole, error: currentAccountRoleError } =
      await client
        .from('accounts_memberships')
        .select('account_role')
        .eq('user_id', currentUserAccount.id)
        .single();

    if (currentAccountRoleError) {
      throw new Error(
        `Error fetching user account role: ${currentAccountRoleError.message}`,
      );
    }

    const currentUserRole = currentUserAccountRole?.account_role;


    // Check if the current user is trying to delete themselves
    if (userData.user.id === clientId) {
      // Prevent client_owner from deleting their own account
      if (currentUserRole === 'client_owner') {
        throw new Error('A client owner cannot delete their own account');
      }
    }

    // Ensure only allowed roles can delete the client
    if (!allowedRolesToDeleteMembers.includes(currentUserRole)) {
      throw new Error('You do not have permission to delete this client');
    }

    // Proceed to delete the client
    const { error: deleteError } = await client
      .from('clients')
      .delete()
      .eq('user_client_id', clientId)
      .eq('agency_id', currentUserAccount.organization_id);

    if (deleteError) {
      throw new Error(`Error deleting the client: ${deleteError.message}`);
    }
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};