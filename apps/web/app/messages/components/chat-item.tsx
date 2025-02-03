'use client';

import { Chats } from "~/lib/chats.types";
import { MessageCircle } from 'lucide-react'
import { useChat } from "./context/chat-context";
import { useRouter } from "next/navigation";
export default function ChatItem({ chat, isActive = false }: { chat: Chats.Type; isActive?: boolean }) {
  const { setActiveChat, setActiveChatData } = useChat();

  const router = useRouter();
  return (
    <button

      onClick={() => {
        setActiveChat(chat.id.toString());
        setActiveChatData(chat);
        router.refresh()
      }}


      className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3 ${
        isActive ? 'bg-gray-50' : ''
      }`}
    >
      <div className="relative">
        <MessageCircle className="w-12 h-12 rounded-full object-cover p-2 pl-4" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-medium truncate">{chat.name}</h3>
          <span className="text-sm text-gray-500 flex-shrink-0">4:00pm</span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {chat.name || 'No messages yet'}
        </p>
      </div>
    </button>
  );
}