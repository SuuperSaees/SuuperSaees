'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Session } from '../../../../../../../../apps/web/lib/sessions.types';

export const createSession = async (sessionData: Session.Insert) => {
  try {
    const client = getSupabaseServerComponentClient({ admin: true });
    const { data: sessionInfo, error: sessionInfoError } = await client
      .from('sessions')
      .insert({
        ...sessionData,
      })
      .select('id')
      .single();

    if (sessionInfoError) {
      throw new Error(sessionInfoError.message);
    }

    return sessionInfo;
  } catch (error) {
    console.error(error);
  }
};
