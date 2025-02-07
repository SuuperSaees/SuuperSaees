'use client';

import ChatSearchHeader from "./chat-search-header";
import ChatList from "./chat-list";
import { Members } from "~/lib/members.types";

export default function ChatInbox({ teams }: { teams: Members.Type }) {  
  return (
    <div className="h-full flex flex-col">
      <ChatSearchHeader teams={teams} />
      <ChatList />
    </div>
  );
}