'use server';

import { Activity } from '~/lib/activity.types';
// import { BriefResponse } from '~/lib/brief.types';
import { Message } from '~/lib/message.types';
import { Review } from '~/lib/review.types';

import { getActivities } from '../activity/get-activities';
// import { getBriefResponses } from '../briefs/get-briefs';
import { getMessages } from '../chat-messages/chat-messages.action';
import { getReviews } from '../reviews/get-reviews';

type Config = {
  pagination?: {
    cursor?: string | number;
    limit?: number;
    endCursor?: string | number;
  };
};

export type InteractionResponse = {
  messages: Message.Response['data'];
  activities: Activity.Response['data'];
  reviews: Review.Response['data'];
  // briefResponses: BriefResponse.Response[];
  nextCursor: string | null;
};

// Common interface for all interaction types
type MessageInteraction = {
  created_at: string;
  type: 'message';
  data: Message.Response['data'][0];
};

type ActivityInteraction = {
  created_at: string;
  type: 'activity';
  data: Activity.Response['data'][0];
};

type ReviewInteraction = {
  created_at: string;
  type: 'review';
  data: Review.Response['data'][0];
};

type InteractionItem =
  | MessageInteraction
  | ActivityInteraction
  | ReviewInteraction;

export const getInteractions = async (
  orderId: number,
  // orderUUID: string,
  config?: Config,
): Promise<InteractionResponse> => {
  try {
    const limit = config?.pagination?.limit ?? 10;
    const cursor = config?.pagination?.cursor;

    // Fetch with a small buffer to account for uneven distribution across data sources
    // This ensures we have enough data to properly paginate without over-fetching
    const bufferSize = Math.min(20, Math.ceil(limit * 0.5)); // 50% buffer, max 20 items
    const fetchConfig = {
      pagination: {
        cursor,
        limit: limit + bufferSize,
      },
    };

    // Fetch all three types of data in parallel
    const [messagesResult, activitiesResult, reviewsResult] =
      await Promise.allSettled([
        getMessages(orderId, fetchConfig),
        getActivities(orderId, fetchConfig),
        getReviews(orderId, fetchConfig),
      ]);

    // Handle potential errors gracefully
    const messages =
      messagesResult.status === 'fulfilled' ? messagesResult.value.data : [];
    const activities =
      activitiesResult.status === 'fulfilled'
        ? activitiesResult.value.data
        : [];
    const reviews =
      reviewsResult.status === 'fulfilled' ? reviewsResult.value.data : [];

    // Log any errors for debugging
    if (messagesResult.status === 'rejected') {
      console.error('Error fetching messages:', messagesResult.reason);
    }
    if (activitiesResult.status === 'rejected') {
      console.error('Error fetching activities:', activitiesResult.reason);
    }
    if (reviewsResult.status === 'rejected') {
      console.error('Error fetching reviews:', reviewsResult.reason);
    }

    // Convert all interactions to a common format for sorting
    const allInteractions: InteractionItem[] = [
      ...messages.map(
        (msg): MessageInteraction => ({
          created_at: msg.created_at,
          type: 'message',
          data: msg,
        }),
      ),
      ...activities.map(
        (act): ActivityInteraction => ({
          created_at: act.created_at,
          type: 'activity',
          data: act,
        }),
      ),
      ...reviews.map(
        (rev): ReviewInteraction => ({
          created_at: rev.created_at,
          type: 'review',
          data: rev,
        }),
      ),
    ];

    // Sort all interactions by created_at in descending order (newest first)
    allInteractions.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // Apply pagination to the merged and sorted result
    const paginatedInteractions = allInteractions.slice(0, limit);

    // Determine if there's more data available
    // We have more data if any of the sources returned their full fetch amount (indicating they might have more)
    // OR if our merged result has more items than requested
    const sourcesHaveMore =
      (messagesResult.status === 'fulfilled' &&
        messagesResult.value.nextCursor !== null) ||
      (activitiesResult.status === 'fulfilled' &&
        activitiesResult.value.nextCursor !== null) ||
      (reviewsResult.status === 'fulfilled' &&
        reviewsResult.value.nextCursor !== null);

    const hasMoreData = allInteractions.length > limit || sourcesHaveMore;
    const nextCursor =
      hasMoreData && paginatedInteractions.length > 0
        ? (paginatedInteractions[paginatedInteractions.length - 1]
            ?.created_at ?? null)
        : null;

    // Separate back into original types
    const paginatedMessages = paginatedInteractions
      .filter((item): item is MessageInteraction => item.type === 'message')
      .map((item) => item.data);

    const paginatedActivities = paginatedInteractions
      .filter((item): item is ActivityInteraction => item.type === 'activity')
      .map((item) => item.data);

    const paginatedReviews = paginatedInteractions
      .filter((item): item is ReviewInteraction => item.type === 'review')
      .map((item) => item.data);

    // only fetch brief responses if there's no more data
    // if (!hasMoreData) {
    //   briefResponses = await getBriefResponses(orderUUID);
    // }

    return {
      // briefResponses,
      messages: paginatedMessages,
      activities: paginatedActivities,
      reviews: paginatedReviews,
      nextCursor,
    };
  } catch (error: unknown) {
    console.error('Error fetching interactions:', error);
    throw error;
  }
};
