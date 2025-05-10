import React, { useState } from 'react';
import { Button } from '@kit/ui/button';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@kit/ui/spinner';
import { Send, XIcon } from 'lucide-react';
import { Input } from '@kit/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@kit/ui/avatar";
import { MarkerIcon } from '~/(main)/orders/[id]/components/file-icons';
import { Annotation } from '~/lib/annotations.types';
import { Message } from '~/lib/message.types';

interface AnnotationMarkerProps {
  x: number;
  y: number;
  number: number;
  onClick?: () => void;
  isActive?: boolean;
  annotation: any;
}

export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  x,
  y,
  number,
  onClick,
  isActive = false,
  annotation,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`absolute ${isActive ? 'z-50' : 'z-40'}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: isHovered ? 'pointer' : 'default',
        transform: `translate(-50%, -50%)`, // Centrado fijo
        transformOrigin: 'center', // Asegura que la escala se aplique desde el centro
        scale: isHovered ? '1.1' : '1', // Usamos scale como propiedad separada
        transition: 'scale 0.2s ease-out',
      }}
    >
      <MarkerIcon />
      {annotation.accounts && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
            <Avatar className="w-6 h-6">
              <AvatarImage src={annotation.accounts?.settings?.picture_url ?? ''} />
              <AvatarFallback>
                {annotation.accounts?.name?.charAt(0).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </div>
  );
};

interface AnnotationChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, is_first_message: boolean) => Promise<void>;
  messages: Message.Type[];
  isLoading?: boolean;
  annotation: Annotation.Type;
  isInitialMessageOpen: boolean;
}

export const AnnotationChat: React.FC<AnnotationChatProps> = ({
  isOpen,
  onClose,
  onSubmit,
  messages,
  isLoading = false,
  annotation,
  isInitialMessageOpen,
}) => {
  const [newMessage, setNewMessage] = React.useState('');
  const { t } = useTranslation('orders');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      if(messages.length === 0 && annotation.message_content === 'Annotation') {
        await onSubmit(newMessage, true);
      } else {
        await onSubmit(newMessage, false);
      }
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg sm:max-w-[425px] w-[425px]">
        <div className="flex justify-between items-center p-4">
          <h3 className="font-semibold text-lg">
            {t('annotations.chat.title')}
          </h3>
          <XIcon className="w-4 h-4 cursor-pointer" onClick={onClose}/>
        </div>
        <div className="flex flex-col gap-4 h-[300px] overflow-y-auto p-4 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Spinner className="w-6 h-6" />
            </div>
          ) : (
            <>
              {annotation.message_content !== 'Annotation' && !isInitialMessageOpen && (
                <div className="flex flex-col items-start gap-3.5 self-stretch bg-gray-50 p-4">
                  <div className="flex items-start justify-between w-full">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={annotation.accounts?.settings?.picture_url ?? ''} />
                        <AvatarFallback>
                          {annotation.accounts?.name?.charAt(0).toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="overflow-hidden text-gray-900 truncate font-inter text-base font-bold leading-6">
                      {annotation.accounts?.name}
                    </p>
                    <p className="text-gray-600 font-inter text-xs font-normal leading-5 w-[25%] text-end">
                      {new Date(annotation.created_at).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className="px-4 text-gray-900 font-inter text-sm font-normal">
                    {annotation.message_content}
                  </p>
                </div>
              )}
              {messages.map((message) => (
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
                    <p className="text-gray-600 font-inter text-xs font-normal leading-5 w-[25%] text-end">
                      {new Date(message.created_at).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className="px-4 text-gray-900 font-inter text-sm font-normal">{message.content}</p>
                </div>
              ))}
            </>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t mt-auto">
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