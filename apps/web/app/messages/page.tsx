import ChatInbox from './components/chat-inbox';
import ChatThread from './components/chat-thread';
import { Suspense } from 'react';
import { ChatProvider } from './components/context/chat-context';


export default function MessagesPage() {
  return (
    <ChatProvider>
      <div className="h-full flex border-t">
        <div className="w-[380px] border-r flex flex-col bg-white">
          <Suspense fallback={<div>Loading...</div>}>
            <ChatInbox />
          </Suspense>
        </div>
        <div className="flex-1 flex flex-col bg-white">
          <Suspense fallback={<div>Loading...</div>}>
            <ChatThread />
          </Suspense>
        </div>
      </div>
    </ChatProvider>
  );
}