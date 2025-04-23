'use server';

import { Activity } from '~/lib/activity.types';
import { Message } from '~/lib/message.types';
import { Review } from '~/lib/review.types';

import { getActivities } from '../activity/get-activities';
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
  messages: Message.Response[];
  activities: Activity.Response[];
  reviews: Review.Response[];
};

export async function getInteractions(
  orderId: number,
  config?: Config,
): Promise<InteractionResponse> {
  try {
    const messages = await getMessages(orderId, config);

    // To avoid inconsistencies, we'll fetch activities and reviews separately by generating a new config
    // The new config is going to have activities and reviews within the same time range as the messages
    // This way, we can be sure that the activities and reviews are consistent with the messages
    // And when the user fetches the activities and reviews, they will be in the same order as the messages

    let newConfig = { ...config };
    
    // Only set up cursor range if we have messages
    if (messages.length > 0) {
      newConfig = {
        ...config,
        pagination: {
          cursor: messages[0]?.created_at,
          limit: 10,
          endCursor: messages[messages.length - 1]?.created_at,
        },
      };
    }
    
    const activities = await getActivities(orderId, newConfig).catch(
      (error) => {
        console.error('Error fetching activities:', error);
        return [];
      },
    );
    
    const reviews = await getReviews(orderId, newConfig).catch((error) => {
      console.error('Error fetching reviews:', error);
      return [];
    });

    return {
      messages,
      activities,
      reviews,
    };
  } catch (error: unknown) {
    console.error('Error fetching interactions:', error);
    throw error;
  }
}
