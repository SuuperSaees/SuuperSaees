import React from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kit/ui/popover"
import { Button } from '@kit/ui/button';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@kit/ui/spinner';
import { Send, XIcon } from 'lucide-react';
import { Input } from '@kit/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@kit/ui/avatar";

interface AnnotationMarkerProps {
  x: number;
  y: number;
  number: number;
  onClick?: () => void;
  isActive?: boolean;
}

export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  x,
  y,
  number,
  onClick,
  isActive = false,
}) => {
  const { t } = useTranslation('orders');

  return (
    <div
      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${
        isActive ? 'z-50' : 'z-40'
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
    >
      <svg width="47" height="47" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.06446 89.1179L7.98838 86.2359L6.06446 89.1179C6.4491 89.3746 6.79638 89.4945 6.91375 89.534C7.07464 89.5881 7.21071 89.6214 7.29386 89.6402C7.46114 89.678 7.60942 89.7003 7.70126 89.713C7.895 89.7396 8.10346 89.7588 8.29114 89.7736C8.67956 89.8043 9.18973 89.8321 9.78001 89.8582C10.9709 89.9109 12.6186 89.962 14.559 90.0109C18.4462 90.1088 23.5825 90.1996 28.7535 90.2757C38.8946 90.425 49.3574 90.5206 50.7246 90.4955C73.1432 90.4735 90.5 70.6739 90.5 46.9982C90.5 23.2786 72.8599 3.5 50.4511 3.5C39.5583 3.5 29.4493 7.1608 21.625 14.2605C13.7991 21.3616 8.45755 31.7196 6.75261 44.7805L6.75254 44.781C6.47005 46.9476 5.62861 56.7012 4.88139 65.8635C4.50507 70.4778 4.14874 74.9917 3.8933 78.4043C3.7657 80.109 3.66263 81.5474 3.59479 82.5888C3.56102 83.1072 3.53503 83.5416 3.5192 83.8664C3.5114 84.0264 3.50505 84.1801 3.50203 84.3125C3.50056 84.3774 3.49934 84.459 3.50041 84.5449L3.50047 84.5502C3.50097 84.5979 3.50321 84.8111 3.53861 85.0585C3.76716 86.6549 4.63991 88.1669 6.06446 89.1179Z" fill="#2F70F1"/>
        <path d="M6.06446 89.1179L7.98838 86.2359L6.06446 89.1179C6.4491 89.3746 6.79638 89.4945 6.91375 89.534C7.07464 89.5881 7.21071 89.6214 7.29386 89.6402C7.46114 89.678 7.60942 89.7003 7.70126 89.713C7.895 89.7396 8.10346 89.7588 8.29114 89.7736C8.67956 89.8043 9.18973 89.8321 9.78001 89.8582C10.9709 89.9109 12.6186 89.962 14.559 90.0109C18.4462 90.1088 23.5825 90.1996 28.7535 90.2757C38.8946 90.425 49.3574 90.5206 50.7246 90.4955C73.1432 90.4735 90.5 70.6739 90.5 46.9982C90.5 23.2786 72.8599 3.5 50.4511 3.5C39.5583 3.5 29.4493 7.1608 21.625 14.2605C13.7991 21.3616 8.45755 31.7196 6.75261 44.7805L6.75254 44.781C6.47005 46.9476 5.62861 56.7012 4.88139 65.8635C4.50507 70.4778 4.14874 74.9917 3.8933 78.4043C3.7657 80.109 3.66263 81.5474 3.59479 82.5888C3.56102 83.1072 3.53503 83.5416 3.5192 83.8664C3.5114 84.0264 3.50505 84.1801 3.50203 84.3125C3.50056 84.3774 3.49934 84.459 3.50041 84.5449L3.50047 84.5502C3.50097 84.5979 3.50321 84.8111 3.53861 85.0585C3.76716 86.6549 4.63991 88.1669 6.06446 89.1179Z" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.06446 89.1179L7.98838 86.2359L6.06446 89.1179C6.4491 89.3746 6.79638 89.4945 6.91375 89.534C7.07464 89.5881 7.21071 89.6214 7.29386 89.6402C7.46114 89.678 7.60942 89.7003 7.70126 89.713C7.895 89.7396 8.10346 89.7588 8.29114 89.7736C8.67956 89.8043 9.18973 89.8321 9.78001 89.8582C10.9709 89.9109 12.6186 89.962 14.559 90.0109C18.4462 90.1088 23.5825 90.1996 28.7535 90.2757C38.8946 90.425 49.3574 90.5206 50.7246 90.4955C73.1432 90.4735 90.5 70.6739 90.5 46.9982C90.5 23.2786 72.8599 3.5 50.4511 3.5C39.5583 3.5 29.4493 7.1608 21.625 14.2605C13.7991 21.3616 8.45755 31.7196 6.75261 44.7805L6.75254 44.781C6.47005 46.9476 5.62861 56.7012 4.88139 65.8635C4.50507 70.4778 4.14874 74.9917 3.8933 78.4043C3.7657 80.109 3.66263 81.5474 3.59479 82.5888C3.56102 83.1072 3.53503 83.5416 3.5192 83.8664C3.5114 84.0264 3.50505 84.1801 3.50203 84.3125C3.50056 84.3774 3.49934 84.459 3.50041 84.5449L3.50047 84.5502C3.50097 84.5979 3.50321 84.8111 3.53861 85.0585C3.76716 86.6549 4.63991 88.1669 6.06446 89.1179Z" stroke="black" strokeOpacity="0.01" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M46.4589 61.087C44.6301 61.087 43.1477 59.6046 43.1477 57.7758V36.2731C43.1477 34.4443 44.6301 32.9619 46.4589 32.9619C48.2876 32.9619 49.7701 34.4443 49.7701 36.2731V57.7758C49.7701 59.6046 48.2876 61.087 46.4589 61.087ZM35.0548 50.2149C33.2927 50.2149 31.8643 48.7865 31.8643 47.0244C31.8643 45.2624 33.2927 43.8339 35.0548 43.8339H57.863C59.625 43.8339 61.0534 45.2624 61.0534 47.0244C61.0534 48.7865 59.625 50.2149 57.8629 50.2149H35.0548Z" fill="white"/>
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
          <span className="text-brand font-bold text-sm">
            {number}
          </span>
        </div>
      </div>
    </div>
  );
};

interface AnnotationChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  messages: Array<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
  }>;
  isLoading?: boolean;
  annotationName: string;
}

export const AnnotationChat: React.FC<AnnotationChatProps> = ({
  isOpen,
  onClose,
  onSubmit,
  messages,
  isLoading = false,
  annotationName,
}) => {
  const [newMessage, setNewMessage] = React.useState('');
  const { t } = useTranslation('orders');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSubmit(newMessage);
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg sm:max-w-[425px] w-[425px]">
        <div className="flex justify-between items-center p-4">
          <h3 className="font-semibold text-lg">
            {annotationName}
          </h3>
          <XIcon className="w-4 h-4 cursor-pointer" onClick={onClose}/>
        </div>
        <div className="flex flex-col gap-4 h-[400px] overflow-y-auto p-4 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Spinner className="w-6 h-6" />
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex flex-col items-start gap-3.5 self-stretch bg-gray-50 p-4">
                <div className="flex items-start justify-between w-full">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.accounts?.user_settings?.picture_url} />
                      <AvatarFallback>
                        {message.accounts?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="overflow-hidden text-gray-900 truncate font-inter text-base font-bold leading-6">{message.accounts.name}</p>
                  <p className="text-gray-600 font-inter text-xs font-normal leading-5">
                    {new Date(message.created_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }).replace(/^./, str => str.toUpperCase())}
                  </p>
                </div>
                <p className="px-4 text-gray-900 font-inter text-sm font-normal">{message.content}</p>
                {/* <Avatar className="w-8 h-8">
                  <AvatarImage src={message.accounts?.user_settings?.picture_url} />
                  <AvatarFallback>
                    {message.accounts?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3 flex-1">
                  <p className="text-sm text-gray-600">{message.content}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div> */}
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('annotations.chat.placeholder')}
          />
          <Button type="submit"><Send className="w-4 h-4" /></Button>
        </form>
      </div>
      <div 
        className="fixed inset-0 bg-black/50 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}; 