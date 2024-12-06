import { format } from 'date-fns';
import { Message } from '../context/activity-context';
import { useActivityContext } from '../context/activity-context';
import { KeyIcon } from 'lucide-react';
import { Trans } from '@kit/ui/trans';
import UserFile from './user-file';

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
          { ["agency_owner", "agency_member", "agency_project_manager"].includes(userRole) && message.visibility === "internal_agency" &&
            <span className="text-gray-400 flex items-center gap-1">
              {' '} <KeyIcon className="w-4 h-4" /> <Trans i18nKey="internalMessage" />
            </span>
          }
        </div>
        <small className="">{`${date}`}</small>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none w-full bg-slate-0 overflow-hidden leading-relaxed">
        <div className={` break-words rounded-r-md rounded-b-md p-4 whitespace-normal ${message.visibility === "internal_agency" ? "bg-yellow-50 rounded-lg" : "bg-slate-50"}`} dangerouslySetInnerHTML={{ __html: content }} />
        {message.files && message.files.length > 0 && (
          <div className="pl-4 flex max-w-full gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            {message.files.map((file) => (
              <UserFile key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;