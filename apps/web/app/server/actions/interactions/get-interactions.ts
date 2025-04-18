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
  };
};


  export type InteractionResponse = {
    messages: Message.Response[];
    activities: Activity.Response[];
    reviews: Review.Response[];
  }

export async function getInteractions(
  orderId: number,
  config?: Config,
): Promise<InteractionResponse> {
  try {
    const [messages, activities, reviews] = await Promise.all([
      getMessages(orderId, config),
      getActivities(orderId, config),
      getReviews(orderId, config),
    ]);

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
