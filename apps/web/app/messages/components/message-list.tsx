'use client';

import { useEffect, useRef } from 'react';
import Message from './message';
import { Message as MessageType } from '~/lib/message.types';

interface MessageListProps {
  messages: MessageType.Type[];
  isLoading: boolean;
}


export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}