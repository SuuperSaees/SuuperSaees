'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { getPluginById } from '../services/plugin-services';

export const getPluginByIdAction = async (pluginId: string) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const result = await getPluginById(client, pluginId);

    if (result.success === false) {
      return { success: false, message: result.message, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error getting plugin:', error);
    return { success: false, message: 'Failed to get plugin', error };
  }
};
