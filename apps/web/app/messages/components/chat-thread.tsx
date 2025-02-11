'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { EllipsisVertical, Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import EditableHeader from '~/components/editable-header';
import { Members } from '~/lib/members.types';
import { generateUUID } from '~/utils/generate-uuid';

import ChatEmptyState from './chat-empty-state';
import ChatMembersSelector from './chat-members-selector';
import { useChat } from './context/chat-context';
import MessageList from './message-list';
import RichTextEditor from '../../components/messages/rich-text-editor';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import * as tus from 'tus-js-client';
import { FileUpload } from '../../components/messages/types';

export default function ChatThread({ agencyTeam }: { agencyTeam: Members.Organization }) {
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
    setChatId,
    setMembers,
  } = useChat();
  const userId = user.id;
  const chatById = chatByIdQuery.data;
  const isLoading = chatByIdQuery.isLoading;




  const handleMembersUpdate = async (members: string[]) => {
    await membersUpdateMutation.mutateAsync(members);
  };

  const handleDelete = async () => {
    await deleteChatMutation.mutateAsync();
    // Clear the conversation
    setActiveChat(null);
    setChatId('');
  };



  const handleUpdate = async (name: string) => {
    await updateChatMutation.mutateAsync(name);
  };

  const handleSendMessage = async (message: string, fileIds?: string[]) => {
    await addMessageMutation.mutateAsync({
      content: message,
      userId,
      fileIds,
      temp_id: generateUUID(),
    });
  };
  // Set 
  // members 
  useEffect(() => {
    if(chatByIdQuery.data && chatByIdQuery.data.members) {
      setMembers(chatByIdQuery.data.members);
    }
  }, [chatByIdQuery.data, setMembers
    
  ])

  const [uploads, setUploads] = useState<Record<string, { progress: number; status: string; url: string | null }>>({});
  const supabase = useSupabase();

  const handleFileUpload = async (file: File, setUploadsFunction: Dispatch<SetStateAction<FileUpload[]>>, fileId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    // const fileId = crypto.randomUUID();
    setUploads((prev) => ({
      ...prev,
      [fileId]: {
        progress: 0,
        status: 'uploading',
        url: null
      }
    }));

    const bucketName = 'chats';
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uuid = crypto.randomUUID();
    const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
    console.log('file', file)
    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName,
          objectName: fileId,
          contentType: file.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024, // 6MB,
        onError: (error) => {
          console.error('Error uploading file:', error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
          console.log(`Uploading: ${percentage}% done`)
          setUploadsFunction((prev) => {
 
            console.log('prev', prev)
            const newUpload = prev.find((upload) => upload.id === fileId) ?? {
              id: fileId,
              file: file,
              progress: 0,
              status: 'uploading',
              previewUrl: null
            }
            if (newUpload) {
              newUpload.progress = parseFloat(percentage)
              newUpload.status = percentage === '100.00' ? 'success' : 'uploading'
              
            }
            const newUploads = [...prev.filter((upload) => upload.id !== fileId), newUpload]
            return newUploads
          });
          setUploads((prev) => {
            const newUploads = { ...prev };
            if (fileId && newUploads[fileId]) {
              newUploads[fileId].progress = parseFloat(percentage);
            }
            return newUploads;
          });
        },
        onSuccess: (data) => {
          console.log('Upload successful:', data);
          resolve(data);
        },
      })
      
      // Check if there are any previous uploads to continue.
      void upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length && previousUploads[0]) {
          upload.resumeFromPreviousUpload(previousUploads[0])
        }

        // Start the upload
        upload.start()
      })
    })
  };


  if (!activeChat) {
    return <ChatEmptyState />;
  }

  const activeChatDataName = { ...activeChat }.name;
  const activeChatDataId = { ...activeChat }.id;
  


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
            variant="chat"
            maxWidth={600}
            maxWindowWidthRatio={0.5}
          />
        </div>
        <div className="flex items-center gap-2">
          <ChatMembersSelector
            agencyTeam={{
              ...agencyTeam,
              members: agencyTeam.members?.filter(member => {
                const selectedMember = chatById?.members?.find(m => m.id === member.id);
                
                if (!selectedMember) return true;
                
                return selectedMember.visibility;
              })
            }}
            selectedMembers={chatById?.members?.filter((member) => member.visibility) ?? []}


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
                onClick={async () => {
                  setIsPopupOpen(false);
                  await handleDelete();
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
