'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Activity } from '~/lib/activity.types';
interface Config {
  pagination?: {
    cursor?: string | number;
    limit?: number;
  };
}

export async function getActivities(orderId?: number, config?: Config): Promise<Activity.Response[]> {
  const client = getSupabaseServerComponentClient();

  try {
    let baseQuery = client
      .from('activities')
      .select(
        '*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))',
      )
      .order('created_at', { ascending: false })
      .limit(config?.pagination?.limit ?? 10);

    if (orderId) {
      baseQuery = baseQuery.eq('order_id', orderId);
    }

    if (config?.pagination) {
      baseQuery = baseQuery.lt('created_at', config.pagination.cursor);
    }

    const { data: activities, error: activitiesError } = await baseQuery;

    if (activitiesError) {
      throw new Error(`Error fetching activities: ${activitiesError.message}`);
    }

    return activities;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
