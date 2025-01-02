import { useState } from 'react';
import { Message } from '~/lib/message.types'
import ChatMessage from './message';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserMessageProps {
  message: Message.Type;
}

const UserMessage = ({ message }: UserMessageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isClientGuest = message?.user?.name?.toLowerCase().includes('guest') &&
  message?.user?.email?.toLowerCase().includes('guest') &&
  message?.user?.email?.toLowerCase().includes('@suuper.co');

  return (
    <div
      className="flex w-full items-start gap-4 rounded-lg p-2 transition duration-300 hover:bg-grayTrue-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AvatarDisplayer
        displayName={
          message?.user?.settings?.picture_url ?? message?.user?.picture_url ?? isClientGuest
            ? null
            : message?.user?.name
        }
        pictureUrl={
          message?.user?.settings?.picture_url ?? message?.user?.picture_url
        }
        text={
          message?.user?.settings?.name ?? message?.user?.name
            ? (message?.user?.settings?.name ?? message?.user?.name)
            : undefined
        }
        isClientGuest={isClientGuest}
      />

      <ChatMessage key={message?.id} message={message} isHovered={isHovered} />
    </div>
  );
};

export default UserMessage;