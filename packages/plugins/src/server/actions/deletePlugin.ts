'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { deletePlugin } from '../services/plugin-services';

export const deletePluginAction = async (id: string) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const result = await deletePlugin(client, id);

    if (result.success === false) {
      return { success: false, message: result.message, error: result.error };
    }

    return { success: true, message: 'Plugin deleted successfully' };
  } catch (error) {
    console.error('Error deleting plugin:', error);
    return { success: false, message: 'Failed to delete plugin', error };
  }
};
