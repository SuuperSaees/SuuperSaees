'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Review } from '~/lib/review.types';
import { transformDataArray } from '../utils/transformers';
interface Config {
  pagination?: {
    cursor?: string | number;
    limit?: number;
    endCursor?: string | number;
  };
}
export async function getReviews(orderId?: number, config?: Config): Promise<Review.Response> {
  try {
    const limit = config?.pagination?.limit ?? 10;
    const client = getSupabaseServerComponentClient();

    let baseQuery = client
      .from('reviews')
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

    const { data: reviews, error: reviewsError } = await baseQuery;

    if (reviewsError)
      throw new Error(`Error fetching reviews: ${reviewsError.message}`);

    const transformedReviews = transformDataArray(reviews);
    return {
      data: transformedReviews.slice(0, limit),
      nextCursor: transformedReviews.length > limit ? transformedReviews[limit]?.created_at ?? null : null,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
