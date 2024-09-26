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
    <div className="flex w-auto flex-col p-2 bg-red-500 rounded-sm hover:bg-slate-50 gap-1">
      <div className="flex justify-between w-full gap-4"> 
        <span className="font-semibold">{message.user.name}</span>
        <small>{`${date}`}</small>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none bg-slate-0 p-4 max-w-[62rem] overflow-hidden overflow-ellipsis">
        <div className='w-[62rem] overflow-hidden overflow-ellipsis break-words whitespace-normal pr-4' dangerouslySetInnerHTML={{ __html: content }} />
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
