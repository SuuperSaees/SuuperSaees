import { Avatar, AvatarFallback, AvatarImage } from "@kit/ui/avatar";
interface ResolvedChatProps {
  chat: any;    
}

const ResolvedChat = ({ chat }: ResolvedChatProps) => {
  return (
    <>
      <div className="flex flex-col items-start gap-3.5 self-stretch hover:bg-gray-50">
        <div className="flex items-start justify-between w-full">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Avatar>
              <AvatarImage src={chat.accounts.user_settings.picture_url} alt={chat.accounts.name} />
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
      </div>
    </>
  )
}

export default ResolvedChat;
