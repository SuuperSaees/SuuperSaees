'use client';

import { useEffect, useRef } from 'react';

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

  const combinedInteractions = combineChatInteractions(messages, activities);

  // Sort combined interactions by date/time (oldest first)
  const sortedInteractions = sortChatInteractions(combinedInteractions);

  // Group interactions by day
  const groupedInteractions = groupChatInteractionsByDay(sortedInteractions);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        Loading messages...
      </div>
    );
  }

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
                <UserMessage message={interaction as MessageType.Type} />
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
