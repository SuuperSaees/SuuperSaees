import { format } from 'date-fns';
import { Message } from '../context/activity-context';
import ImageContainer from './ui/image-container';
import { useActivityContext } from '../context/activity-context';
import { KeyIcon } from 'lucide-react';
import { Trans } from '@kit/ui/trans';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { userRole } = useActivityContext();
  const date = format(new Date(message.created_at), 'MMM dd, p');
  // Ensure content is a string
  const content = message.content ?? '';
  return (
    <div className={`flex flex-col w-full p-2 `}>
      <div className="flex justify-between w-full">
      <div className="flex gap-2">
      <span className="font-semibold">{message.user.name}</span>
      { ["agency_owner", "agency_member", "agency_project_manager"].includes(userRole) && message.visibility === "internal_agency" &&
        <span className="text-gray-400 flex items-center gap-1">
          {' '} <KeyIcon className="w-4 h-4" /> <Trans i18nKey="internalMessage" />
        </span>
        }
      </div>
        <small>{`${date}`}</small>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none w-full bg-slate-0 p-4 overflow-hidden">
        {/* Only rounded bottom left and right top right */}
        <div className={`w-full overflow-hidden break-words rounded-r-md rounded-b-md p-4 whitespace-normal pr-2 ${message.visibility === "internal_agency" ? "bg-[#FEF9D2]" : "bg-slate-100"}`} dangerouslySetInnerHTML={{ __html: content }} />
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