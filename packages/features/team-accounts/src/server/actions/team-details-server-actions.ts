'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { UpdateTeamNameSchema } from '../../schema/update-team-name.schema';

export const updateTeamAccountName = enhanceAction(
  async (params) => {
    const client = getSupabaseServerComponentClient();
    const { name, path, slug } = params;

    const { error, data } = await client
      .from('accounts')
      .update({
        name,
        slug,
      })
      .match({
        slug,
      })
      .select('slug')
      .single();

    if (error) {
      throw error;
    }

    const newSlug = data.slug;

    if (newSlug) {
      const nextPath = path.replace('[account]', newSlug);

      redirect(nextPath);
    }

    return { success: true };
  },
  {
    schema: UpdateTeamNameSchema,
  },
);
