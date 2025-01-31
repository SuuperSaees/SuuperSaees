'use client';

import ChatSearchHeader from "./chat-search-header";
import ChatList from "./chat-list";

export default function ChatInbox() {  
  return (
    <div className="h-full flex flex-col">
      <ChatSearchHeader />
      <ChatList />
    </div>
  );
}