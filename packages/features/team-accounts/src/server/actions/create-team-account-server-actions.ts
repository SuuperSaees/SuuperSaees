'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { CreateTeamSchema } from '../../schema/create-team.schema';
import { createCreateTeamAccountService } from '../services/create-team-account.service';

export const createOrganizationAccountAction = enhanceAction(
  async (params, user) => {
    const client = getSupabaseServerActionClient();
    const service = createCreateTeamAccountService(client);

    const { data, error } = await service.createNewOrganizationAccount({
      name: params.name,
      userId: user.id,
    });

    if (error) {
      throw new Error('Error creating team account');
    }

    const accountHomePath = '/home/' + data.slug;

    redirect(accountHomePath);
  },
  {
    schema: CreateTeamSchema,
  },
);
