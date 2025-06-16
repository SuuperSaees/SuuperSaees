'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Spinner } from '@kit/ui/spinner';

import { Activity } from '~/lib/activity.types';
import { Message as MessageType } from '~/lib/message.types';

import {
  ChatInteractionType,
  combineChatInteractions,
  groupChatInteractionsByDay,
  sortChatInteractions,
} from '../utils/messages/transform';
import ActivityAction from './activity-action';
import UserMessage from './user-message';

interface MessageListProps {
  messages: MessageType.Type[];
  isLoading: boolean;
  activities?: Activity.Type[];
}

export default function MessageList({
  messages,
  isLoading,
  activities = [],
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { workspace: userWorkspace } = useUserWorkspace();
  // Memoize the transformation operations to prevent unnecessary recalculations
  const groupedInteractions = useMemo(() => {
    const combinedInteractions = combineChatInteractions(messages, activities);
    const sortedInteractions = sortChatInteractions(combinedInteractions);
    return groupChatInteractionsByDay(sortedInteractions);
  }, [messages, activities]); //

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) return <Spinner className="mx-auto h-5 w-5 text-gray-500" />;

  return (
    <div className="space-y-4">
      {Object.entries(groupedInteractions).map(([date, interactions]) => (
        <div key={date} className="flex flex-col gap-8">
          <div className="relative mt-2 flex w-full items-center justify-center rounded-md before:absolute before:left-0 before:top-1/2 before:h-[0.3px] before:w-full before:bg-gray-100">
            <h3 className="z-[10] whitespace-nowrap rounded-full border border-gray-300 bg-white p-1 px-2 pr-[1rem] text-sm font-semibold text-gray-700">
              {date}
            </h3>
          </div>
          {interactions.map((interaction) => {
            return interaction.class === ChatInteractionType.MESSAGE ? (
              <div className="flex w-full" key={interaction.id}>
                <UserMessage
                  message={interaction as MessageType.Type}
                  canDelete={userWorkspace?.id === interaction.user_id}
                />
              </div>
            ) : interaction.class === ChatInteractionType.ACTIVITY ? (
              <ActivityAction
                activity={interaction as Activity.Type}
                key={interaction.id}
              />
            ) : null;
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
