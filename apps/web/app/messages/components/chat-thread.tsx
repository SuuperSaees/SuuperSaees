'use client';

import { useState } from 'react';

import { EllipsisVertical, Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import EditableHeader from '~/components/editable-header';
import { Members } from '~/lib/members.types';

import ChatEmptyState from './chat-empty-state';
import ChatMembersSelector from './chat-members-selector';
import { useChat } from './context/chat-context';
import MessageList from './message-list';
import RichTextEditor from './rich-text-editor';

export default function ChatThread({ teams }: { teams: Members.Type }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const {
    activeChat,
    activeChatData,
    messages,
    isLoading,
    handleMembersUpdateMutation,
    handleDeleteMutation,
    handleUpdate,
    handleSendMessage,
    chatById,
  } = useChat();

  const handleMembersUpdate = (members: string[]) => {
    console.log(members);
    handleMembersUpdateMutation.mutate(members);
  };

  const handleDelete = () => {
    handleDeleteMutation.mutate();
  };

  if (!activeChat || !activeChatData) {
    return <ChatEmptyState />;
  }

  const activeChatDataName = { ...activeChatData }.name;
  const activeChatDataId = { ...activeChatData }.id;

  console.log('messages', messages);
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <EditableHeader
            initialName={activeChatDataName}
            id={activeChatDataId}
            userRole={'owner'}
            updateFunction={handleUpdate}
            rolesThatCanEdit={new Set(['owner'])}
          />
        </div>
        <div className="flex items-center gap-2">
          <ChatMembersSelector
            teams={teams}
            selectedMembers={
              chatById?.members?.map((m: { id: string }) => m.id) ?? []
            }
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
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Rich Text Editor */}
      <div className="border-t p-4">
        <RichTextEditor
          onComplete={handleSendMessage}
          showToolbar={true}
          isEditable={true}
        />
      </div>
    </div>
  );
}
