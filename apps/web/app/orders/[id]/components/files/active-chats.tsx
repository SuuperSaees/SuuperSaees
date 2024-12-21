import { Avatar, AvatarFallback, AvatarImage } from "@kit/ui/avatar";
import { Button } from "@kit/ui/button";
import { Check } from "lucide-react";

interface ActiveChatsProps {
  chat: any;
  onUpdate: (annotationId: string, status: 'completed' | 'draft' | 'active') => void;
}


const ActiveChats = ({ chat, onUpdate }: ActiveChatsProps) => {
  console.log('chat', chat)
  return (
    <>
      <div className="flex flex-col items-start gap-3.5 self-stretch hover:bg-gray-50">
        <div className="flex items-start justify-between w-full">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Avatar>
              <AvatarImage src={chat.accounts.settings.picture_url} alt={chat.accounts.name} />
              <AvatarFallback>{chat.accounts.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <p className="overflow-hidden text-gray-900 truncate font-inter text-base font-bold leading-6">{chat.accounts.name}</p>
          <p className="text-gray-600 font-inter text-xs font-normal leading-5">
            {new Date(chat.message_created_at).toLocaleDateString('es-ES', {
              weekday: 'long',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).replace(/^./, str => str.toUpperCase())}
          </p>
        </div>
        <p className="px-4 text-gray-900 font-inter text-sm font-normal">{chat.message_content} ({chat.number})</p>
        <div className="px-4 flex justify-start">
          <Button variant="outline" onClick={() => onUpdate(chat.id, 'completed')} className="flex h-10 px-3 py-2 items-center gap-1 rounded-md bg-blue-500/10">  
            <Check className="w-4 h-4 text-blue-600" />
            <p className="text-blue-600 font-inter text-sm font-semibold leading-6">Resolved</p>
          </Button>
        </div>
      </div>
    </>
  )
}

export default ActiveChats;
