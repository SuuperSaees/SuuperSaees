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
    <div className="flex items-start gap-4 w-full hover:bg-grayTrue-100 rounded-lg p-2 transition-colors duration-200" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}> 
      <AvatarDisplayer
        displayName={message?.user.picture_url ? null : message?.user.name}
        pictureUrl={message?.user.picture_url}
        text={message?.user.name ? message.user.name : undefined}
      />

      <ChatMessage key={message?.id} message={message} isHovered={isHovered}/>
    </div>
  );
};

export default UserMessage;
