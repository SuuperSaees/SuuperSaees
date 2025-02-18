'use client';

import {  Dispatch, SetStateAction, useEffect, useState } from 'react';

import { EllipsisVertical, Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import { File } from '~/lib/file.types';
import { Members } from '~/lib/members.types';

import RichTextEditor from '../../components/messages/rich-text-editor';
import { FileUpload } from '../../components/messages/types';
import ChatEmptyState from './chat-empty-state';
import ChatMembersSelector from './chat-members-selector';
import { useChat } from './context/chat-context';
import MessageList from './message-list';

export default function ChatThread({
  agencyTeam,
}: {
  agencyTeam: Members.Organization;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const {
    user,
    activeChat,
    messages,
    membersUpdateMutation,
    deleteChatMutation,
    updateChatMutation,
    chatByIdQuery,
    addMessageMutation,
    setActiveChat,
    setMembers,
    handleFileUpload,
  } = useChat();
  const userId = user.id;
  const chatById = chatByIdQuery.data;
  const isLoading = chatByIdQuery.isLoading;

  const handleMembersUpdate = async (members: string[]) => {
    await membersUpdateMutation.mutateAsync(members);
  };

  const handleDelete =  () => {
    deleteChatMutation.mutate(activeChat?.id ?? '');
  };

  const handleUpdate = async (name: string) => {
    await updateChatMutation.mutateAsync(name);
  };

  const handleSendMessage = async (
    message: string,
    fileUploads?: FileUpload[],
    setUploads?: Dispatch<SetStateAction<FileUpload[]>>,
  ) => {
    const messageId = crypto.randomUUID();
    let filesToAdd: File.Insert[] | undefined = undefined;
    // add the files to the bd
    if (fileUploads) {
      filesToAdd = [...fileUploads].map((upload) => {
        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chats/${chatByIdQuery.data?.id}/uploads/${upload.id}`;
        return {
          name: upload.file.name,
          size: upload.file.size,
          type: upload.file.type,
          url: fileUrl,
          message_id: messageId,
          user_id: userId,
        };
      });

      const newMessage = {
        id: messageId,
        content: message,
        user_id: userId,
        temp_id: messageId,
      };
      if (setUploads) {
        // Since we're going to add the files to the bd, we need to update the current upload to be pending
        setUploads((prev) => prev.map((upload) => ({ ...upload, status: 'uploading' })));
      }
      await addMessageMutation.mutateAsync({
        message: newMessage,
        files: filesToAdd,
      });
      if (setUploads) {
        // Since we're going to add the files to the bd, we need to update the current upload to be pending
        setUploads((prev) => prev.map((upload) => ({ ...upload, status: 'success' })));
      }
    }
  };
  // Set
  // members
  useEffect(() => {
    if (chatByIdQuery.data && chatByIdQuery.data.members) {
      setMembers(chatByIdQuery.data.members);
    }
  }, [chatByIdQuery.data, setMembers]);

  // console.log('IS CREATING MESSAGE', addMessageMutation.isPending );

  if (!activeChat) {
    return <ChatEmptyState />;
  }

  const activeChatDataName = { ...activeChat }.name;
  const isOwner = chatById?.user_id === user.id;
  const canEditName = isOwner || chatById?.members?.some((member) => member.id === user.id);
  return (
    <div className="flex h-full flex-col min-w-0">
      {/* Header */}

      <div className="flex items-center justify-between border-b p-4 min-h-20">
        <div className="flex-1 min-w-0 ">
          {canEditName ? (
            <input
              type="text"
              value={activeChatDataName}
            onChange={(e) => {
              const newChat = { ...activeChat, name: e.target.value };
              setActiveChat(newChat);
            }}
            onBlur={async (e) => {
              if (e.target.value !== chatById?.name) {
                await handleUpdate(e.target.value);
              }
            }}
              className="w-full text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 text-primary-900 overflow-hidden text-ellipsis"
            />
          ) : (
            <span className="block w-full text-xl font-semibold text-primary-900 overflow-hidden text-ellipsis">
              {activeChatDataName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ChatMembersSelector
            agencyTeam={{
              ...agencyTeam,
              members: agencyTeam.members?.filter((member) => {
                const selectedMember = chatById?.members?.find(
                  (m) => m.id === member.id,
                );

                if (!selectedMember) return true;

                return selectedMember.visibility;
              }),
            }}
            selectedMembers={
              chatById?.members?.filter((member) => member.visibility) ?? []
            }
            onMembersUpdate={handleMembersUpdate}
            isLoading={isLoading}
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
                onClick={ () => {
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
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
}
