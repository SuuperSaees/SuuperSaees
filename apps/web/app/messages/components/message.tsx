'use client';

import { useState } from 'react';

import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { Message as MessageType } from '~/lib/message.types';
import AvatarDisplayer from '~/orders/[id]/components/ui/avatar-displayer';

import { useChat } from './context/chat-context';

interface MessageProps {
  message: MessageType.Type;
}

export default function Message({ message }: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteMessageMutation } = useChat();

  const handleDelete = async () => {
    await deleteMessageMutation.mutateAsync(message.id);
  };

  return (
    <div
      className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AvatarDisplayer
        displayName={message.user?.name}
        pictureUrl={message.user?.picture_url}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{message.user?.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            {isHovered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div
          className="mt-1 text-gray-700"
          dangerouslySetInnerHTML={{ __html: message.content ?? '' }}
        />

        {message.files && message.files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {file.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
