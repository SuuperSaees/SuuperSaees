'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { getPluginsByAccount } from '../services/plugin-services';

export const getPluginsByAccountAction = async (
  accountId: string,
  limit: number,
  offset: number,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const result = await getPluginsByAccount(client, accountId, limit, offset);

    if (result.success === false) {
      return { success: false, message: result.message, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error getting plugins for account:', error);
    return {
      success: false,
      message: 'Failed to get plugins for account',
      error,
    };
  }
};
