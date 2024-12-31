'use client';

import { useState } from 'react';

import RichTextEditor from '~/components/ui/rich-text-editor';
import { sendEmailsOfOrderMessages } from '~/team-accounts/src/server/actions/orders/update/update-order';

import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';
import { Separator } from '@kit/ui/separator';
import { getUrlFile } from '~/team-accounts/src/server/actions/files/get/get-files';
// import { insertOrderFiles } from '~/team-accounts/src/server/actions/files/create/create-file';
import { AgencyStatus } from '~/lib/agency-statuses.types';

const ActivityPage = ({ agencyName, agencyStatuses, activeTab, agencyId, clientOrganizationId }: { agencyName: string, agencyStatuses: AgencyStatus.Type[], activeTab: string, agencyId: string, clientOrganizationId: string }) => {
  const { order } = useActivityContext();
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const handleFileIdsChange =  (fileIds: string[]) => {
    return {fileIds};
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
      <Interactions agencyStatuses={agencyStatuses} activeTab={activeTab}/>
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
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          agencyId={agencyId}
          clientOrganizationId={clientOrganizationId}
          folderId={order.uuid}
          handleFileIdsChange={handleFileIdsChange}
        />
      </div>
  </div>
    
  );
};

export default ActivityPage;