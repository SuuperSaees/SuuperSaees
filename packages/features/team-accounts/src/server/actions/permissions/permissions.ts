'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getSession } from '../../../../../../../apps/web/app/server/actions/accounts/accounts.action';


// import { Database } from '../../../../../../../apps/web/lib/database.types';
import { getUserRole } from '../members/get/get-member-account';

// Generic permission check
export const checkGeneralPermission = async (
  client: SupabaseClient<Database>,
  userId: string,
  organizationId: string,
  permissionName:
    | 'roles.manage'
    | 'billing.manage'
    | 'settings.manage'
    | 'members.manage'
    | 'invites.manage'
    | 'tasks.write'
    | 'tasks.delete'
    | 'messages.write'
    | 'messages.read',
) => {
  const { data: hasPermission, error: permissionError } = await client.rpc(
    'has_permission',
    {
      user_id: userId,
      organization_id: organizationId ?? '',
      permission_name: permissionName,
    },
  );
  if (permissionError) {
    console.error('Permission error:', permissionError);
    throw new Error(`No permission for ${permissionName}`);
  }
  return hasPermission;
};

export const hasPermissionToAddTeamMembers = async () => {
  const client = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) throw userError.message;

  const userId = userData.user.id;
  const organizationId = (await getSession())?.organization?.id ?? '';

  const role = await getUserRole();
  // There's an error on the policy for roles below owner as allow add for "same "hierarchy level when should be "equal or lower"
  // so add special condition
  if (role === 'agency_project_manager') {
    return true;
  } else {
    // check for general permission on the account, be either client or agency
    const { data: hasPermission, error: permissionError } = await client.rpc(
      'has_permission',
      {
        user_id: userId,
        organization_id: organizationId ?? '',
        permission_name: 'invites.manage',
      },
    );

    if (permissionError) {
      console.error('Error checking permission:', permissionError);
      throw new Error('The account has not permissions to MANAGE team members');
    }

    return hasPermission;
  }
};