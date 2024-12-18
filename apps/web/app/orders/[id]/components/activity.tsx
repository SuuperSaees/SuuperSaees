'use client';

import { useState } from 'react';

import RichTextEditor from '~/components/ui/rich-text-editor';
import { sendEmailsOfOrderMessages } from '~/team-accounts/src/server/actions/orders/update/update-order';

import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';
import { Separator } from '@kit/ui/separator';
import { getUrlFile } from '~/team-accounts/src/server/actions/files/get/get-files';
import { insertOrderFiles } from '~/team-accounts/src/server/actions/files/create/create-file';

const ActivityPage = ({ agencyName }: { agencyName: string }) => {
  const { order } = useActivityContext();
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileIdsChange = async (fileIds: string[]) => {
    const orderFilesToInsert = fileIds.map((fileId) => {
      return {
        order_id: order.uuid,
        file_id: fileId,
      };
    });

    for (const orderFile of orderFilesToInsert) {
      try {
        const orderFileInserted = await insertOrderFiles(orderFile.order_id, orderFile.file_id);
        if (orderFileInserted?.error) {
          console.error('Error inserting order FILE:', orderFileInserted.error);
        }


      } catch (error) {
        console.error('Unexpected error inserting order FILE:', error);
      }
    }
  };

  const { addMessage, userRole, userWorkspace } = useActivityContext();

  const handleOnCompleteMessageSend = async (messageContent: string, fileIdsList?: string[]) => {
    try {
      if (fileIdsList && fileIdsList?.length > 0) {
        const idsListFromServer = [];
        for (const fileId of fileIdsList) {
          const fileData = await getUrlFile(fileId);
          if (fileData === null) {
            console.error('Error getting file:', fileData);
          } else {
            idsListFromServer.push(fileData.id);
          }
        }

        if(idsListFromServer.length > 0) {
          await addMessage({message: messageContent, fileIdsList: idsListFromServer});
          await sendEmailsOfOrderMessages(
            order.id,
            order.title,
            messageContent,
            userWorkspace.name ?? '',
            order?.assigned_to?.map((assignee) => assignee?.agency_member?.email) ??
              [],
            agencyName,
            new Date().toLocaleDateString(),
            userWorkspace.id ?? '',
          );
        } else if (messageContent !== '<p></p>' && idsListFromServer.length === 0) {
          await addMessage({message: messageContent});
          await sendEmailsOfOrderMessages(
            order.id,
            order.title,
            messageContent,
            userWorkspace.name ?? '',
            order?.assigned_to?.map((assignee) => assignee?.agency_member?.email) ??
              [],
            agencyName,
            new Date().toLocaleDateString(),
            userWorkspace.id ?? '',
          );
        }
        
      } else {
        await addMessage({message: messageContent});
        await sendEmailsOfOrderMessages(
          order.id,
          order.title,
          messageContent,
          userWorkspace.name ?? '',
          order?.assigned_to?.map((assignee) => assignee?.agency_member?.email) ??
            [],
          agencyName,
          new Date().toLocaleDateString(),
          userWorkspace.id ?? '',
        );
      }
 
    } catch (error) {
      console.error('Failed to send message or upload files:', error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 h-auto min-h-full">
      <Separator className='w-full'/>
      <Interactions />
      <Separator className='w-full'/>
      <div 
        className={`flex flex-col justify-end pt-3 px-8 mb-4`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
      > 
        <RichTextEditor
          className="w-full overflow-auto"
          onComplete={handleOnCompleteMessageSend}
          uploadFileIsExternal
          toggleExternalUpload={() => setShowFileUploader(!showFileUploader)}
          userRole={userRole}
          handleFileIdsChange={handleFileIdsChange}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      </div>
  </div>
    
  );
};

export default ActivityPage;