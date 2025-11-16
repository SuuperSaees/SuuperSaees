'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Activity } from '~/lib/activity.types';
interface Config {
  pagination?: {
    cursor?: string | number;
    limit?: number;
    endCursor?: string | number;
  };
}

export const getActivities = async (orderId?: number, config?: Config): Promise<Activity.Response> => {
  const client = getSupabaseServerComponentClient();
  const limit = config?.pagination?.limit ?? 10;
  try {
    let baseQuery = client
      .from('activities')
      .select(
        '*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))',
      )
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (orderId) {
      baseQuery = baseQuery.eq('order_id', orderId);
    }

    if (config?.pagination?.cursor) {
      baseQuery = baseQuery.lt('created_at', config.pagination.cursor);
    }
    
    if (config?.pagination?.endCursor) {
      baseQuery = baseQuery.gte('created_at', config.pagination.endCursor);
    }

    const { data: activities, error: activitiesError } = await baseQuery;

    if (activitiesError) {
      throw new Error(`Error fetching activities: ${activitiesError.message}`);
    }

    return {
      data: activities.slice(0, limit),
      nextCursor: activities.length > limit ? activities[limit]?.created_at ?? null : null
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}


