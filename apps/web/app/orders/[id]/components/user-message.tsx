import { Message } from '../context/activity-context';
import ChatMessage from './message';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserMessageProps {
  message: Message;
}

const UserMessage = ({ message }: UserMessageProps) => {
  return (
    <div className="flex gap-1">
      <AvatarDisplayer
        displayName={null}
        pictureUrl={message.user.picture_url}
        status="online"
      />

      <ChatMessage key={message.id} message={message} />
    </div>
  );
};

export default UserMessage;
