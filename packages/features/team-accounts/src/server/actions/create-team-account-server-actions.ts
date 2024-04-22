'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { CreateTeamSchema } from '../../schema/create-team.schema';
import { createCreateTeamAccountService } from '../services/create-team-account.service';

const TEAM_ACCOUNTS_HOME_PATH = z
  .string({
    required_error: 'variable TEAM_ACCOUNTS_HOME_PATH is required',
  })
  .min(1)
  .parse(process.env.TEAM_ACCOUNTS_HOME_PATH);

export async function createOrganizationAccountAction(
  params: z.infer<typeof CreateTeamSchema>,
) {
  const { name: accountName } = CreateTeamSchema.parse(params);

  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (auth.error) {
    redirect(auth.redirectTo);
  }

  const userId = auth.data.id;
  const service = createCreateTeamAccountService(client);

  const { data, error } = await service.createNewOrganizationAccount({
    name: accountName,
    userId,
  });

  if (error) {
    throw new Error('Error creating team account');
  }

  const accountHomePath = TEAM_ACCOUNTS_HOME_PATH + '/' + data.slug;

  redirect(accountHomePath);
}
