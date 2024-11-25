import { notFound } from 'next/navigation';
import { getUserRole } from '../../../../../../../packages/features/team-accounts/src/server/actions/members/get/get-member-account';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { isSuperAdmin } from './is-super-admin';

/**
 * @name adminAction
 * @description Wrap a server action to ensure the user is a super admin.
 * @param fn
 */
export function adminAction<Args, Response>(fn: (params: Args) => Response) {
  return async (params: Args) => {
    const isAdmin = await isSuperAdmin(getSupabaseServerActionClient());
    const userRole = await getUserRole().catch((err) => {
      console.error(`Error client, getting user role: ${err}`)
      return ''
    });

    if(isAdmin || userRole === 'agency_owner' || userRole === 'agency_project_manager') {
      return fn(params);
    }else{
      notFound();
    }

  };
}
