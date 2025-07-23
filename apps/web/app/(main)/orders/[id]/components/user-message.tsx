import { useState, forwardRef, Ref } from 'react';
import ChatMessage from './message';
import AvatarDisplayer from './ui/avatar-displayer';
import { DataResult } from '../context/activity.types';

interface UserMessageProps {
  message: DataResult.Message;
}

const UserMessage = forwardRef(({ message, ...props }: UserMessageProps, ref: Ref<HTMLDivElement>) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isClientGuest = message?.user?.name?.toLowerCase().includes('guest') &&
  message?.user?.email?.toLowerCase().includes('guest') &&
  message?.user?.email?.toLowerCase().includes('@suuper.co');

  return (
    <div
      className="flex w-full items-start gap-2 rounded-lg p-2 transition duration-300 hover:bg-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={ref}
      {...props}
    >
      <AvatarDisplayer
        displayName={ isClientGuest ? null : message?.user?.name }
        
        pictureUrl={
          message?.user?.picture_url
        }
        text={
          isClientGuest ? undefined : message?.user?.name
        }
        isClientGuest={isClientGuest}
      />

      <ChatMessage key={message?.id} message={message} isHovered={isHovered} />
    </div>
  );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;