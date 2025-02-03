'use client';

import { useState } from 'react';
import { useChat } from './context/chat-context';
import ChatEmptyState from './chat-empty-state';
import EditableHeader from '~/components/editable-header';
import { EllipsisVertical, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Button } from '@kit/ui/button';
import { toast } from 'sonner';
import { Members } from '~/lib/members.types';
import ChatMembersSelector from './chat-members-selector';
import RichTextEditor from './rich-text-editor';
import MessageList from './message-list';
import { updateChat } from '~/server/actions/chats/chats.action';

export default function ChatThread({ 
  teams, 
  userId 
}: { 
  teams: Members.Type;
  userId: string;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { 
    activeChat,
    activeChatData,
    setActiveChat,
    setActiveChatData,
    messages,
    addMessage,
    isLoading
  } = useChat();

  const handleSendMessage = async (content: string, fileIds?: string[]) => {
    if (!activeChatData) return;
    
    try {
      await addMessage({ content, fileIds });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpdate = async (value: string) => {
    if (!activeChatData) return;
    
    try {
      await updateChat({
        id: activeChatData.id,
        name: value,
      });
      toast.success('Chat name updated successfully');
    } catch (error) {
      toast.error('Failed to update chat name');
    }
  };

  if (!activeChat || !activeChatData) {
    return <ChatEmptyState userId={userId} />;
  }

  const handleMembersUpdate = async (members: string[]) => {
    await Promise.resolve();
    console.log('update members', members);
  };

  const handleDelete = async () => {
    await Promise.resolve();
    console.log('delete');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <EditableHeader
            initialName={activeChatData.name}
            id={activeChatData.id.toString()}
            userRole={'owner'}
            updateFunction={handleUpdate}
            rolesThatCanEdit={new Set(['owner'])}
          />
        </div>
        <div className="flex items-center gap-2">
          <ChatMembersSelector
            teams={teams}
            selectedMembers={activeChatData.members?.map(m => m.id) ?? []}
            onMembersUpdate={handleMembersUpdate}
          />
          <Popover open={isPopupOpen} onOpenChange={setIsPopupOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-600"
                onClick={() => {
                  setIsPopupOpen(false);
                  handleDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete chat
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
        />
      </div>

      {/* Rich Text Editor */}
      <div className="p-4 border-t">
        <RichTextEditor
          onComplete={handleSendMessage}
          showToolbar={true}
          isEditable={true}
        />
      </div>
    </div>
  );
}