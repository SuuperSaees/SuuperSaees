import ChatInbox from './components/chat-inbox';
import ChatThread from './components/chat-thread';
export default function MessagesPage() {
  // aqui hace las peticiones a las server actions.
  // y renderiza el componente.
  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        <ChatInbox />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatThread />
      </div>
    </div>
  );
}