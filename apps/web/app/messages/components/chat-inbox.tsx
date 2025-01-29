'use client';

import ChatSearchHeader from "./chat-search-header";
import ChatList from "./chat-list";
import { Chats } from "~/lib/chats.types";

export default function ChatInbox({ chats }: { chats: Chats.Type[] }) {  
  return (
    <div className="h-full flex flex-col">
      <ChatSearchHeader />
      <ChatList chats={chats} />
    </div>
  );
}