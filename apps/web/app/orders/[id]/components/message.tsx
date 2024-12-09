import { format } from 'date-fns';
import { Message } from '../context/activity-context';
import { useActivityContext } from '../context/activity-context';
import { ClockIcon, KeyIcon } from 'lucide-react';
import { Trans } from '@kit/ui/trans';
import ImageContainer from './ui/image-container';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { userRole } = useActivityContext();
  const date = format(new Date(message.created_at), 'MMM dd, p');
  // Ensure content is a string
  const content = message.content ?? '';
  return (
    <div className={`flex flex-col gap-2 w-full p-0 max-w-full min-w-0`}>
      <div className="flex justify-between w-full">
      <div className="flex gap-2">
      <span className="font-semibold">{message.user.name}</span> 
      {
        message?.pending &&
      <ClockIcon className="h-3 w-3 text-muted-foreground self-center" />
      }
      { ["agency_owner", "agency_member", "agency_project_manager"].includes(userRole) && message.visibility === "internal_agency" &&
        <span className="text-gray-400 flex items-center gap-1">
          {' '} <KeyIcon className="w-4 h-4" /> <Trans i18nKey="internalMessage" />
        </span>
        }
      </div>
  
        <small className="">{`${date}`}</small>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none w-full bg-slate-0 max-w-prose overflow-hidden leading-relaxed">
        {/* Only rounded bottom left and right top right */}
        <div className={` break-words rounded-r-md rounded-b-md p-4 whitespace-normal ${message.visibility === "internal_agency" ? "bg-yellow-50 rounded-lg" : "bg-slate-50"}`} dangerouslySetInnerHTML={{ __html: content }} />
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap max-w-prose gap-4 ">
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