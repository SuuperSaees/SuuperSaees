import { Message } from '../context/activity-context';
import ChatMessage from './message';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserMessageProps {
  message: Message;
}

const UserMessage = ({ message }: UserMessageProps) => {
  return (
    <div className="flex items-start gap-4 w-full"> 
      <AvatarDisplayer
        displayName={message?.user.picture_url ? null : message?.user.name}
        pictureUrl={message?.user.picture_url}
        text={message?.user.name ? message.user.name : undefined}
      />

      <ChatMessage key={message?.id} message={message} />
    </div>
  );
};

export default UserMessage;
