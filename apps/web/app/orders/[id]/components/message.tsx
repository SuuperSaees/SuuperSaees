import { format } from 'date-fns';

import { Message } from '../context/activity-context';
import ImageContainer from './ui/image-container';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const date = format(new Date(message.created_at), 'MMM dd, p');

  // Ensure content is a string
  const content = message.content ?? '';

  return (
    <div className="flex w-fit flex-col gap-1">
      <div className="flex justify-between gap-4">
        <span className="font-semibold">{message.user.name}</span>
        <small>{`${date}`}</small>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none bg-gray-50 p-4">
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {/* <p className="max-w-xs">{message.content}</p> */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {message.files.map((file) => (
              <ImageContainer
                key={file.id}
                name={file.name}
                url={file.url}
                alt={`${file.name} image`}
                size={file.size}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
