import { useState } from 'react';

import { Message } from '../context/activity-context';
import ChatMessage from './message';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserMessageProps {
  message: Message;
}

const UserMessage = ({ message }: UserMessageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="flex w-full items-start gap-4 rounded-lg p-2 transition duration-300 hover:bg-grayTrue-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AvatarDisplayer
        displayName={
          message?.user?.settings?.picture_url ?? message?.user.picture_url
            ? null
            : message?.user.name
        }
        pictureUrl={
          message?.user?.settings?.picture_url ?? message?.user.picture_url
        }
        text={
          message?.user?.settings?.name ?? message?.user.name
            ? (message?.user?.settings?.name ?? message?.user.name)
            : undefined
        }
      />

      <ChatMessage key={message?.id} message={message} isHovered={isHovered} />
    </div>
  );
};

export default UserMessage;
