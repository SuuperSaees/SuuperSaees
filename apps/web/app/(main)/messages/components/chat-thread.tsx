"use client";

import { useCallback, useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Editor } from "@tiptap/react";
import { EllipsisVertical, Trash2 } from "lucide-react";

import { Button } from "@kit/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover";

import { File } from "~/lib/file.types";
import { Members } from "~/lib/members.types";
import { getAccountPlugin } from "~/server/actions/account-plugins/account-plugins.action";

import LoomRecordButton from "../../apps/components/loom-record-button";
import {
  InternalMessagesToggle,
  useInternalMessaging,
} from "../../../components/messages";
import RichTextEditor from "../../../components/messages/rich-text-editor";
import { FileUpload } from "../../../components/messages/types";
import { TimerContainer } from "../../../components/timer-container";
import ChatEmptyState from "./chat-empty-state";
import ChatMembersSelector from "./chat-members-selector";
import { useChat } from "./context/chat-context";
import MessageList from "./message-list";
import WalletSummarySheet from "~/(credits)/components/wallet-summary-sheet";

export default function ChatThread({
  agencyTeam,
}: {
  agencyTeam: Members.Organization;
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { getInternalMessagingEnabled } = useInternalMessaging();
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
    fileUploads,
    handleFileRemove,
  } = useChat();
  const userId = user.id;
  const chatById = chatByIdQuery.data;
  const isLoading = chatByIdQuery.isLoading;
  const handleMembersUpdate = async (params: {
    selectedUserIds: string[];
    agencyMembers: { id: string; role: string }[];
  }) => {
    await membersUpdateMutation.mutateAsync(params);
  };

  const handleDelete = () => {
    deleteChatMutation.mutate(activeChat?.id ?? "");
  };

  const handleUpdate = async (name: string) => {
    await updateChatMutation.mutateAsync(name);
  };

  const handleSendMessage = async (
    message: string,
    fileUploads?: FileUpload[],
  ) => {
    const messageId = crypto.randomUUID();
    let filesToAdd: File.Insert[] | undefined = undefined;
    // add the files to the bd
    if (fileUploads) {
      filesToAdd = [...fileUploads]
        .map((upload) => {
          if (upload.status === "error") return null;
          const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chats/${chatByIdQuery.data?.id}/uploads/${upload.id}`;
          const tempId = crypto.randomUUID();
          return {
            id: upload.id ?? undefined,
            name: upload.file.name,
            size: upload.file.size,
            type: upload.file.type,
            url: fileUrl,
            message_id: messageId,
            user_id: userId,
            temp_id: tempId,
          };
        })
        .filter((f) => f !== null);

      const newMessage = {
        id: messageId,
        content: message,
        user_id: userId,
        temp_id: messageId,
        visibility: getInternalMessagingEnabled()
          ? ("internal_agency" as const)
          : ("public" as const),
      };

      await addMessageMutation.mutateAsync({
        message: newMessage,
        files: filesToAdd,
      });
    }
  };

  const { data: accountPluginData, isLoading: isAccountPluginLoading } =
    useQuery({
      queryKey: ["account-plugins", user.id],
      queryFn: async () => await getAccountPlugin(undefined, "loom"),
      enabled: !!user.id,
      retry: 1,
    });
  // Set the loom app id to the state
  // members
  useEffect(() => {
    if (chatByIdQuery.data && chatByIdQuery.data.members) {
      setMembers(chatByIdQuery.data.members);
    }
  }, [chatByIdQuery.data, setMembers]);

  /**
   * Handles file uploads for the current chat
   *
   * @param file - The file to upload
   * @param fileId - Unique identifier for the upload
   * @param onProgress - Callback to update upload state in the UI
   * @returns Promise resolving to the uploaded file path
   * @throws Error if no active chat or upload fails
   */
  const handleRichTextEditorFileUpload = useCallback(
    async (file: File, onProgress: (upload: FileUpload) => void) => {
      try {
        await handleFileUpload(file, (uploadState) => {
          // Convert FileUploadState to FileUpload and call the progress callback

          onProgress(uploadState);
        });
      } catch (error) {
        console.error("File upload failed:", error);
        // Report error state
        throw error;
      }
    },
    [handleFileUpload],
  );


  // handle before unload
  useEffect(() => {
    const isUploading = fileUploads.some(
      (upload) => upload.status === "uploading",
    );
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome to trigger the dialog
    };

    // Enable the prompt (e.g., when uploading is active)
    if (isUploading) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [fileUploads]);

  if (!activeChat) {
    return <ChatEmptyState />;
  }

  const activeChatDataName = { ...activeChat }.name;
  const isOwner = chatById?.user_id === user.id;
  const canEditName =
    isOwner || chatById?.members?.some((member) => member.id === user.id);

  return (
    <div className="relative flex h-full min-w-0 flex-col">
      {/* Header */}

      <div className="flex min-h-9 items-center justify-between border-b px-6.5 py-3">
        <div className="min-w-0 flex-1">
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
              className="w-full overflow-hidden text-ellipsis border-none bg-transparent text-xl font-semibold text-primary-900 outline-none focus:ring-0"
            />
          ) : (
            <span className="block w-full overflow-hidden text-ellipsis text-xl font-semibold text-primary-900">
              {activeChatDataName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
        <><TimerContainer /><WalletSummarySheet /></>
          <ChatMembersSelector
            agencyTeam={agencyTeam}
            selectedMembers={
              chatById?.members?.filter(
                (member) => member.visibility && !member.deleted_on,
              ) ?? []
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
          onFileUpload={handleRichTextEditorFileUpload}
          onFileRemove={handleFileRemove}
          customActionButtons={[
            (editor: Editor) => (
              <LoomRecordButton
                onAction={(text: string) => editor.commands.setContent(text)}
                loomAppId={accountPluginData?.credentials?.loom_app_id ?? ""}
                isLoading={isAccountPluginLoading}
              />
            ),
            () => (
              <InternalMessagesToggle
                userRole={user.role}
                allowedRoles={[
                  "agency_member",
                  "agency_project_manager",
                  "agency_owner",
                ]}
                className="ml-2"
              />
            ),
          ]}
        />
      </div>
    </div>
  );
}
