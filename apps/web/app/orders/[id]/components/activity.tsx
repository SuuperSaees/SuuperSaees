'use client';

import { useCallback } from 'react';

// import RichTextEditor from '~/components/ui/rich-text-editor';
import RichTextEditor from '../../../components/messages/rich-text-editor';
import { sendEmailsOfOrderMessages } from '~/team-accounts/src/server/actions/orders/update/update-order';
import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';
import { Separator } from '@kit/ui/separator';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { getEmails } from '~/team-accounts/src/server/actions/orders/get/get-mail-info';
import useInternalMessaging from '../hooks/use-messages';
import { Editor } from '@tiptap/react';
import { getOrganization } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import { useQuery } from '@tanstack/react-query';
import { getAgencyForClientByUserId } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import { LoomRecordButton } from '~/apps/components';
import InternalMessagesToggle from '../../../components/messages/internal-messages-toggle';
import { FileUploadState, useFileUpload } from '~/hooks/use-file-upload';
import { File } from '~/lib/file.types';
import { Message } from '~/lib/message.types';


const ActivityPage = ({ agencyName, agencyStatuses }: { agencyName: string, agencyStatuses: AgencyStatus.Type[] }) => {
  const { order } = useActivityContext();

  console.log('order', order);
  const { addMessageMutation, userRole, userWorkspace } = useActivityContext();

  const { getInternalMessagingEnabled } = useInternalMessaging()

  const { upload } = useFileUpload()

  const handleSendMessage = async (messageContent: string, fileUploads?: FileUploadState[], setUploads?: React.Dispatch<React.SetStateAction<FileUploadState[]>>) => {
    try {

      const currentInternalMessagingState = getInternalMessagingEnabled();

      const rolesAvailable = currentInternalMessagingState ? ['agency_member', 'agency_owner', 'agency_project_manager'] :
       ['agency_member', 'agency_owner', 'agency_project_manager', 'client_member', 'client_owner'];

      
      const messageId = crypto.randomUUID();
      const messageTempId = crypto.randomUUID();
      let filesToAdd: File.Insert[] | undefined = [];
      if (fileUploads) {
        filesToAdd = [...fileUploads].map((upload) => {
          const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/orders/uploads/${order.uuid}/${upload.id}`;
          const tempId = crypto.randomUUID();
          return {
            name: upload.file.name,
            size: upload.file.size,
            type: upload.file.type,
            url: fileUrl,
            user_id: userWorkspace.id ?? '',
            temp_id: tempId,
            message_id: messageId,
            reference_id: order.id.toString(),
          };
        })
      }
      const newMessage: Message.Insert = {
        id: messageId,
        content: messageContent,
        user_id: userWorkspace.id ?? '',
        temp_id: messageTempId,
        visibility: getInternalMessagingEnabled() ? 'internal_agency' as const : 'public' as const,
        order_id: order.id,
      };
      await addMessageMutation.mutateAsync({message: newMessage, files: filesToAdd, tempId: messageTempId});
      if(setUploads) {
        setUploads((prev) => {
          return prev.map((upload) => {
            return { ...upload, status: 'success' };
          });
        });
      }
      const emailsData = await getEmails(order.id.toString(), rolesAvailable, userWorkspace.id ?? '');
      await sendEmailsOfOrderMessages(
        order.id,
        order.title,
        messageContent,
        userWorkspace.name ?? '',
        emailsData,
        agencyName,
        new Date().toLocaleDateString(),
        userWorkspace.id ?? '',
      );
 
    } catch (error) {
      console.error('Failed to send message or upload files:', error);
    }
  };

  const organizationData  = useQuery({
    queryKey: ['account-plugins', userWorkspace],
    queryFn: userRole === 'client_member' || userRole === 'client_owner' ? 
      async () => await getAgencyForClientByUserId  (userWorkspace.id ?? '') : 
      async () => await getOrganization(),
    enabled: !!userWorkspace.id,
    retry: 1,
  });

 /**
   * Handles file uploads for the current chat
   *
   * @param file - The file to upload
   * @param setUploadsFunction - Function to update upload state in the UI
   * @param fileId - Unique identifier for the upload
   * @returns Promise resolving to the uploaded file path
   * @throws Error if no active chat or upload fails
   */
 const handleFileUpload = useCallback(
  async (
    file: File,
    fileId: string,
    setUploads?: React.Dispatch<React.SetStateAction<FileUploadState[]>>,
  ) => {

    try {
      const filePath = await upload(file, fileId, {
        bucketName: 'orders',
        path:  `uploads/${order.uuid}`,
        onProgress: (progress) => {
          setUploads?.((prev) => {
            const existingUpload = prev.find((u) => u.id === fileId);
            if (!existingUpload) return prev;

            return prev.map((u) =>
              u.id === fileId
                ? {
                    ...u,
                    progress,
                    status: progress === 100 ? 'success' : 'uploading',
                  }
                : u,
            );
          });
        },
      });

      return filePath;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  },
  [upload, order.uuid],
);
  return (
    <div className="flex w-full flex-col gap-4 h-auto min-h-full">
      <Separator className='w-full'/>
      <Interactions agencyStatuses={agencyStatuses}/>
      <Separator className='w-full'/>
      <div 
        className={`flex flex-col justify-end pt-3 px-8 mb-4`}
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
          onFileUpload={handleFileUpload}
          customActionButtons={[
            (editor: Editor) => (
              <LoomRecordButton
                onAction={(text: string) => editor.commands.setContent(text)}
                loomAppId={organizationData.data?.loom_app_id ?? ''}
                isLoading={organizationData.isLoading}
              />
            ),
            () => (
              <InternalMessagesToggle 
                userRole={userRole} 
                allowedRoles={['agency_member', 'agency_owner', 'agency_project_manager']}
                className="ml-2"
              />
            )
          ]}  
        />
      </div>
  </div>
    
  );
};

export default ActivityPage;