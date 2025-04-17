import { format } from 'date-fns';

import { Activity } from '~/lib/activity.types';
import { Message } from '~/lib/message.types';
import { Review } from '~/lib/review.types';

// Enum to distinguish between message and activity types in chat interactions
export enum ChatInteractionType {
  MESSAGE = 'message',
  ACTIVITY = 'activity',
  REVIEW = 'review',
}

// Union type representing either a Message or an Activity with a class identifier
export type ChatInteraction = (Message.Type | Activity.Type | Review.Type) & {
  class: ChatInteractionType;
};


/**
 * Combines messages and activities into a single array of chat interactions
 * @param messages - Array of Message objects
 * @param activities - Array of Activity objects
 * @returns Combined array of ChatInteraction objects
 */
export const combineChatInteractions = (
  messages: Message.Type[],
  activities: Activity.Type[],
  reviews?: Review.Type[],
): ChatInteraction[] => {
  return [
    ...messages.map((message) => ({
      ...message,
      class: ChatInteractionType.MESSAGE,
    })),
    ...(activities?.map((activity) => ({
      ...activity,
      class: ChatInteractionType.ACTIVITY,
    })) ?? []),
    ...(reviews?.map((review) => ({
      ...review,
      class: ChatInteractionType.REVIEW,
    })) ?? []),
  ];
};

/**
 * Sorts chat interactions by creation date
 * @param interactions - Array of ChatInteraction objects to sort
 * @param direction - Sort direction ('asc' for ascending, 'desc' for descending)
 * @returns Sorted array of ChatInteraction objects
 */
export const sortChatInteractions = (
  interactions: ChatInteraction[],
  direction: 'asc' | 'desc' = 'asc',
): ChatInteraction[] => {
  return interactions.sort((a, b) => {
    return direction === 'asc'
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

/**
 * Groups chat interactions by day
 * @param interactions - Array of ChatInteraction objects
 * @returns Object with dates as keys and arrays of ChatInteraction objects as values
 */
export const groupChatInteractionsByDay = (
  interactions: ChatInteraction[],
): Record<string, ChatInteraction[]> => {
  return interactions.reduce(
    (acc, interaction) => {
      const date = format(new Date(interaction.created_at), 'MMMM d, yyyy');
      acc[date] = [...(acc[date] ?? []), interaction];
      return acc;
    },
    {} as Record<string, ChatInteraction[]>,
  );
};
