import { format } from 'date-fns';
import { Message } from '../context/activity-context';
import { useActivityContext } from '../context/activity-context';
import { ClockIcon, KeyIcon, Trash2, X } from 'lucide-react';
import UserFile from './user-file';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@kit/ui/button';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface ChatMessageProps {
  message: Message;
  isHovered: boolean;
}

const ChatMessage = ({ message, isHovered }: ChatMessageProps) => {
  const { userRole, deleteMessage } = useActivityContext();
  const { user: currentUser } = useUserWorkspace();
  const date = format(new Date(message.created_at), 'MMM dd, p');
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('orders');
  // Ensure content is a string
  const content = message.content ?? '';

  const handleDeleteMessage = async () => {
    await deleteMessage(message.id);
    setIsOpen(false);
  }
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
          {' '} <KeyIcon className="w-4 h-4" /> {t('internalMessage')}
        </span>
        }
      </div>
        <div className="flex gap-2">
          <small className="">{`${date}`}</small>
          {isHovered && currentUser?.id === message.user_id && <Trash2 className="w-4 h-4 hover:text-red-500 cursor-pointer" onClick={() => setIsOpen(true)} />}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none w-full bg-slate-0 overflow-hidden leading-relaxed">
        <div className={` break-words rounded-r-md rounded-b-md p-4 whitespace-normal ${message.visibility === "internal_agency" ? "bg-yellow-50 rounded-lg" : "bg-grayTrue-100"}`} dangerouslySetInnerHTML={{ __html: content }} />
        {message.files && message.files.length > 0 && (
          <div className="pl-4 flex max-w-full gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            {message.files.map((file) => (
              <UserFile key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader >
          <div className="flex justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-100">
              <Trash2 className="w-6 h-6 text-error-600"  />
            </div>
            <X className="w-6 h-6 cursor-pointer text-gray-400" onClick={() => setIsOpen(false)} />
          </div>
        </AlertDialogHeader>
          <AlertDialogTitle>{t('message.deleteMessage')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.deleteMessageDescription')}
          </AlertDialogDescription>
        <AlertDialogFooter>
          <div className="flex justify-between w-full gap-3">
            <AlertDialogCancel className="w-full h-11 font-inter text-[16px] font-semibold leading-[24px]">{t('message.cancel')}</AlertDialogCancel>
            <Button variant="destructive" className="w-full h-11 text-white font-inter text-[16px] font-semibold leading-[24px]" onClick={handleDeleteMessage}>{t('message.delete')}</Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
};

export default ChatMessage;