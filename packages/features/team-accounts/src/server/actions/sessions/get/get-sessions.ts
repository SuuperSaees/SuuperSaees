'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Session } from '../../../../../../../../apps/web/lib/sessions.types';

export const getSessionById = async (sessionId: Session.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient({ admin: true });
    const { data: sessionInfo, error: sessionInfoError } = await client
      .from('sessions')
      .select('client_name, client_email, metadata')
      .eq('id', sessionId)
      .single();

    if (sessionInfoError) {
      throw new Error(sessionInfoError.message);
    }

    return sessionInfo;
  } catch (error) {
    console.error(error);
  }
};
