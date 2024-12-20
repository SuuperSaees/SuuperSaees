
interface ResolvedChatProps {
  chat: any;    
}

const ResolvedChat = ({ chat }: ResolvedChatProps) => {
  return (
    <>
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{chat.name}</h4>
        <p className="text-xs text-gray-500">{chat.lastMessage}</p>
      </div>
      <span className="text-xs text-gray-400">{chat.time}</span>
    </>
  )
}

export default ResolvedChat;
