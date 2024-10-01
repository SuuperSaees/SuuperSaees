import { Message } from '../context/activity-context';
import ChatMessage from './message';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserMessageProps {
  message: Message;
}

const UserMessage = ({ message }: UserMessageProps) => {
  return (
    <div className="grid grid-cols-[5%_94%] grid-rows-1 items-start gap-2 w-full"> 
      <AvatarDisplayer
        displayName={null}
        pictureUrl={message?.user.picture_url}
        text={message?.user.name ? message.user.name : undefined}
      />

      <ChatMessage key={message?.id} message={message} />
    </div>
  );
};

export default UserMessage;
