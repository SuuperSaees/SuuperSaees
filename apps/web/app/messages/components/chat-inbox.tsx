'use client';

import ChatSearchHeader from "./chat-search-header";
import ChatList from "./chat-list";

export default function ChatInbox({ userId }: { userId: string }) {  
  return (
    <div className="h-full flex flex-col">
      <ChatSearchHeader userId={userId}/>
      <ChatList />
    </div>
  );
}