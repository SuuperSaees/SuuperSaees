'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { PluginInsert } from '../../types';
import { createPlugin } from '../services/plugin-services';

export const createPluginAction = async (pluginData: PluginInsert) => {
  try {
    const client =
      getSupabaseServerActionClient() as unknown as SupabaseClient<Database>;

    const newPlugin = await createPlugin(client, pluginData);

    if (newPlugin.success === false) {
      return {
        success: false,
        message: newPlugin.message,
        error: newPlugin.error,
      };
    }

    return { success: true, data: newPlugin.data };
  } catch (error) {
    console.error('Error creating plugin:', error);
    return { success: false, message: 'Failed to create plugin', error };
  }
};
