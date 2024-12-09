'use client';

import { useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import RichTextEditor from '~/components/ui/rich-text-editor';
import { sendEmailsOfOrderMessages } from '~/team-accounts/src/server/actions/orders/update/update-order';

import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';
import { Separator } from '@kit/ui/separator';

const ActivityPage = ({ agencyName }: { agencyName: string }) => {
  const { order } = useActivityContext();
  const client = useSupabase();
  const [showFileUploader, setShowFileUploader] = useState(false);

  const handleFileIdsChange = async (fileIds: string[]) => {
    const orderFilesToInsert = fileIds.map((fileId) => {
      return {
        order_id: order.uuid,
        file_id: fileId,
      };
    });

    for (const orderFile of orderFilesToInsert) {
      try {
        const { error: Err } = await client
          .from('order_files')
          .insert(orderFile);
        if (Err) {
          console.error('Error inserting order FILE:', Err);
        }
      } catch (error) {
        console.error('Unexpected error inserting order FILE:', error);
      }
    }
  };

  const { addMessage, userRole, userWorkspace } = useActivityContext();

  const handleOnCompleteMessageSend = async (messageContent: string, fileIdsList?: string[]) => {
    try {
      if (fileIdsList?.length > 0) {
        const idsListFromServer = [];
        for (const fileId of fileIdsList) {
          const { data: fileData, error: Err } = await client
            .from('files')
            .select('id')
            .eq('id', fileId)
            .single();
          if (Err) {
            console.error('Error getting file:', Err);
          }

          if (fileData?.id !== undefined) {
            idsListFromServer.push(fileData?.id);
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
    <div className="flex w-full flex-col gap-4 h-auto ">
      <Separator className='w-full'/>
      <Interactions />
      <Separator className='w-full'/>
      <div className="flex flex-col justify-end px-8 mb-4"> 
        <RichTextEditor
          className=" w-full overflow-auto"
          onComplete={handleOnCompleteMessageSend}
          uploadFileIsExternal
          toggleExternalUpload={() => setShowFileUploader(!showFileUploader)}
          userRole={userRole}
          handleFileIdsChange={handleFileIdsChange}
        />
      </div>
  </div>
    
  );
};

export default ActivityPage;
