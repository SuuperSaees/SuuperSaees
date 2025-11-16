"use client";

import { useCallback, useEffect } from "react";

// import RichTextEditor from '~/components/ui/rich-text-editor';
import RichTextEditor from "../../../../components/messages/rich-text-editor";
import { sendEmailsOfOrderMessages } from "~/team-accounts/src/server/actions/orders/update/update-order";
import { useActivityContext } from "../context/activity-context";
import Interactions from "./interactions";
import { Separator } from "@kit/ui/separator";
import { AgencyStatus } from "~/lib/agency-statuses.types";
import { getEmails } from "~/team-accounts/src/server/actions/orders/get/get-mail-info";
import useInternalMessaging from "../hooks/use-messages";
import { Editor } from "@tiptap/react";
import { useQuery } from "@tanstack/react-query";
import { LoomRecordButton } from "~/(main)/apps/components";
import InternalMessagesToggle from "../../../../components/messages/internal-messages-toggle";
import { File } from "~/lib/file.types";
import { Message } from "~/lib/message.types";
import { getAccountPlugin } from "~/server/actions/account-plugins/account-plugins.action";
import { FileUpload } from "../../../../components/messages/types";

const ActivityPage = ({
  agencyName,
  agencyStatuses,
}: {
  agencyName: string;
  agencyStatuses: AgencyStatus.Type[];
}) => {
  const { order, handleFileUpload, handleRemoveFile, fileUploads } =
    useActivityContext();

  const { addMessageMutation, userRole, userWorkspace } = useActivityContext();

  const { getInternalMessagingEnabled } = useInternalMessaging();

  // const { upload } = useFileUpload()

  const handleSendMessage = async (
    messageContent: string,
    fileUploads?: FileUpload[],
    _setUploads?: React.Dispatch<React.SetStateAction<FileUpload[]>>,
  ) => {
    try {
      const currentInternalMessagingState = getInternalMessagingEnabled();

      const rolesAvailable = currentInternalMessagingState
        ? ["agency_member", "agency_owner", "agency_project_manager"]
        : [
            "agency_member",
            "agency_owner",
            "agency_project_manager",
            "client_member",
            "client_owner",
          ];

      const messageId = crypto.randomUUID();
      const messageTempId = crypto.randomUUID();
      let filesToAdd: File.Insert[] | undefined = [];
      if (fileUploads) {
        filesToAdd = [...fileUploads]
          .map((upload) => {
            if (upload.status === "error") return null;
            const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/orders/uploads/${order.uuid}/${upload.id}`;
            const tempId = crypto.randomUUID();
            return {
              id: upload.id ?? undefined,
              name: upload.file.name,
              size: upload.file.size,
              type: upload.file.type,
              url: fileUrl,
              user_id: userWorkspace.id ?? "",
              temp_id: tempId,
              message_id: messageId,
              reference_id: order.id.toString(),
            };
          })
          .filter((f) => f !== null);
      }
      const newMessage: Message.Insert = {
        id: messageId,
        content: messageContent,
        user_id: userWorkspace.id ?? "",
        temp_id: messageTempId,
        visibility: getInternalMessagingEnabled()
          ? ("internal_agency" as const)
          : ("public" as const),
        order_id: order.id,
      };
      await addMessageMutation.mutateAsync({
        message: newMessage,
        files: filesToAdd,
        tempId: messageTempId,
      });
      const emailsData = await getEmails(
        order.id.toString(),
        rolesAvailable,
        userWorkspace.id ?? "",
      );
      await sendEmailsOfOrderMessages(
        order.id,
        order.title,
        messageContent,
        userWorkspace.name ?? "",
        emailsData,
        agencyName,
        new Date().toLocaleDateString(),
        userWorkspace.id ?? "",
      );
    } catch (error) {
      console.error("Failed to send message or upload files:", error);
    }
  };

  const { data: accountPluginData, isLoading: isAccountPluginLoading } =
    useQuery({
      queryKey: ["account-plugins", userWorkspace.id],
      queryFn: async () => await getAccountPlugin(undefined, "loom"),
      enabled: !!userWorkspace.id,
      retry: 1,
    });

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
  
  return (
    <div className="flex w-full flex-col gap-4 h-full min-h-0 max-h-full">
      <Separator className="w-full" />
      <Interactions agencyStatuses={agencyStatuses} />
      <Separator className="w-full" />
      <div
        className={`flex flex-col justify-end pt-3 md:px-8 px-0 mb-4`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <RichTextEditor
          className="w-full overflow-auto"
          onComplete={handleSendMessage}
          showToolbar={true}
          isEditable={true}
          onFileUpload={handleRichTextEditorFileUpload}
          onFileRemove={handleRemoveFile}
          customActionButtons={[
            (editor: Editor) => (
              <LoomRecordButton
                onAction={(text: string) => editor.commands.setContent(text)}
                loomAppId={String(
                  accountPluginData?.credentials?.loom_app_id ?? "",
                )}
                isLoading={isAccountPluginLoading}
              />
            ),
            () => (
              <InternalMessagesToggle
                userRole={userRole}
                allowedRoles={[
                  "agency_member",
                  "agency_owner",
                  "agency_project_manager",
                ]}
                className="ml-2"
              />
            ),
          ]}
        />
      </div>
    </div>
  );
};

export default ActivityPage;
