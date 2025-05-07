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

export const getInteractions = async (
  orderId: number,
  // orderUUID: string,
  config?: Config,
): Promise<InteractionResponse> => {
  try {
    const messages = await getMessages(orderId, config);

    // let briefResponses: BriefResponse.Response[] = [];

    // To avoid inconsistencies, we'll fetch activities and reviews separately by generating a new config
    // The new config is going to have activities and reviews within the same time range as the messages
    // This way, we can be sure that the activities and reviews are consistent with the messages
    // And when the user fetches the activities and reviews, they will be in the same order as the messages

    let newConfig = { ...config };
    let nextCursor: string | null = null;
    // Only set up cursor range if we have messages
    if (messages.data.length > 0) {
      newConfig = {
        ...config,
        pagination: {
          cursor: config?.pagination?.cursor ?? messages.data[0]?.created_at,
          limit: 10,
          endCursor: messages.nextCursor ?? messages.data[messages.data.length - 1]?.created_at,
        },
      };
    }

    const activities = await getActivities(orderId, newConfig).catch(
      (error) => {
        console.error('Error fetching activities:', error);
        return { data: [], nextCursor: null };
      },
    );

    const reviews = await getReviews(orderId, newConfig).catch((error) => {
      console.error('Error fetching reviews:', error);
      return { data: [], nextCursor: null };
    });

    // only fetch brief responses if there's next cursor for non of all
    // if (!messages.nextCursor && !activities.nextCursor && !reviews.nextCursor) {
    //   briefResponses = await getBriefResponses(orderUUID);
    // }

    nextCursor = messages.nextCursor;

    // nextCursor is the last from all combined and sorted by created_at in ascending order

    return {
      // briefResponses,
      messages: messages.data,
      activities: activities.data,
      reviews: reviews.data,
      nextCursor,
    };
  } catch (error: unknown) {
    console.error('Error fetching interactions:', error);
    throw error;
  }
}
