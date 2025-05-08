import { format } from 'date-fns';

import { Activity } from '~/lib/activity.types';
import { BriefResponse } from '~/lib/brief.types';
import { Message } from '~/lib/message.types';
import { Review } from '~/lib/review.types';

// Enum to distinguish between message and activity types in chat interactions
export enum ChatInteractionType {
  MESSAGE = 'message',
  ACTIVITY = 'activity',
  REVIEW = 'review',
  BRIEF_RESPONSE = 'brief_response',
}

export type MergedBriefResponses = {
  id: string;
  briefResponses: BriefResponse.Response[];
  class: ChatInteractionType.BRIEF_RESPONSE 
  created_at: string;
}

// Union type representing either a Message or an Activity with a class identifier
export type ChatInteraction = 
  | (Message.Type & { class: ChatInteractionType.MESSAGE })
  | (Activity.Type & { class: ChatInteractionType.ACTIVITY })
  | (Review.Type & { class: ChatInteractionType.REVIEW })
  | MergedBriefResponses


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
  briefResponses?: BriefResponse.Response[],
): ChatInteraction[] => {
  return [
    ...messages.map((message) => ({
      ...message,
      class: ChatInteractionType.MESSAGE as const,
    })),
    ...(activities?.map((activity) => ({
      ...activity,
      class: ChatInteractionType.ACTIVITY as const,
    })) ?? []),
    ...(reviews?.map((review) => ({
      ...review,
      class: ChatInteractionType.REVIEW as const,
    })) ?? []),
    ...(briefResponses ? [
      {
        id: crypto.randomUUID(),
        briefResponses: briefResponses ?? [],
        class: ChatInteractionType.BRIEF_RESPONSE as const,
        created_at: briefResponses?.[0]?.created_at ?? '',
      }
    ] : []),
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
