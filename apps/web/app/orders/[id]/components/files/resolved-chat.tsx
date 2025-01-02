import { Avatar, AvatarFallback, AvatarImage } from "@kit/ui/avatar";
import { Trash2 } from "lucide-react";
import { useState } from "react";
interface ResolvedChatProps {
  chat: any;    
  onDelete: (annotationId: string) => void;
  t: any;
}

const ResolvedChat = ({ chat, onDelete, t }: ResolvedChatProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const renderMessage = (message: string) => {
    if(message === 'Annotation') {
      return ''
    }
    return message;
  }
  return (
    <>
      <div 
        className="flex flex-col items-start gap-3.5 hover:bg-gray-50 px-[16px] py-[12px]"
        onMouseEnter={() => setIsHovering(true)} 
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center w-[75%]">
            <div className="mr-[12px]">
              <Avatar className="w-[45px] h-[45px]">
                <AvatarImage src={chat.accounts.settings.picture_url} alt={chat.accounts.name} />
                <AvatarFallback>{chat.accounts.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <p className="overflow-hidden text-gray-900 truncate text-[16px] font-bold leading-6">{chat.accounts.name}</p>
          </div>
          <p className="text-gray-600 overflow-hidden truncate font-inter text-[14px] font-normal leading-5 w-[25%] text-end">
           {new Date(chat.message_created_at).toLocaleDateString('en-US', {
             month: 'short',
             day: 'numeric'
           })}
         </p>
        </div>
        <p className="py-[13.52px] text-gray-900 font-inter text-sm font-normal break-words w-[98%]">
          {renderMessage(chat.message_content)} {chat.page_number > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              {t('annotations.page')} {chat.page_number}
            </span>
          )}
        </p>
        <div className="flex justify-end w-full">
          {isHovering ? (
            <button onClick={() => onDelete(chat.id)}>
              <Trash2 className="w-4 h-4 text-red-500 mr-2" />
            </button>
          ) : (
            <div className="w-4 h-4"></div>
          )}

        </div>
      </div>
    </>
  )
}

export default ResolvedChat;
