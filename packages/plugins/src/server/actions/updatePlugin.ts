'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { PluginInsert } from '../../types';
import { updatePlugin } from '../services/plugin-services';

export const updatePluginAction = async (
  id: string,
  updates: Partial<PluginInsert>,
) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const result = await updatePlugin(client, id, updates);

    if (result.success === false) {
      return { success: false, message: result.message, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating plugin:', error);
    return { success: false, message: 'Failed to update plugin', error };
  }
};
