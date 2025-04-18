'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Review } from '~/lib/review.types';
interface Config {
  pagination?: {
    cursor?: string | number;
    limit?: number;
  };
}
export async function getReviews(orderId?: number, config?: Config): Promise<Review.Response[]> {
  try {
    const client = getSupabaseServerComponentClient();

    let baseQuery = client
      .from('reviews')
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

    const { data: reviews, error: reviewsError } = await baseQuery;

    if (reviewsError)
      throw new Error(`Error fetching reviews: ${reviewsError.message}`);

    return reviews;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
