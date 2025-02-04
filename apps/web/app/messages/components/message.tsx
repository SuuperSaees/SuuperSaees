'use client';

import { useState } from 'react';
import { ChatMessages } from '~/lib/chat-messages.types';
import { useChat } from './context/chat-context';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@kit/ui/button';
import AvatarDisplayer from '~/orders/[id]/components/ui/avatar-displayer';

interface MessageProps {
  message: ChatMessages.Type;
}

export default function Message({ message }: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteMessage } = useChat();
  
  const handleDelete = async () => {
    await deleteMessage(message.id);
  };

  return (
    <div
      className="group flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AvatarDisplayer
        displayName={message.user?.name}
        pictureUrl={message.user?.picture_url}
      />
      
      <div className="flex-1 min-w-0">
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
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div 
          className="mt-1 text-gray-700"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
        
        {message.files && message.files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
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