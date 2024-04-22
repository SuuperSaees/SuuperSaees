'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { LeaveTeamAccountSchema } from '../../schema/leave-team-account.schema';
import { createLeaveTeamAccountService } from '../services/leave-team-account.service';

export async function leaveTeamAccountAction(formData: FormData) {
  const body = Object.fromEntries(formData.entries());
  const params = LeaveTeamAccountSchema.parse(body);

  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (auth.error) {
    throw new Error('Authentication required');
  }

  const service = createLeaveTeamAccountService(
    getSupabaseServerActionClient({ admin: true }),
  );

  await service.leaveTeamAccount({
    accountId: params.accountId,
    userId: auth.data.id,
  });

  revalidatePath('/home/[account]', 'layout');

  return redirect('/home');
}
