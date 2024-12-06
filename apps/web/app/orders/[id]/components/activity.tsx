'use client';

import { useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import RichTextEditor from '~/components/ui/rich-text-editor';
import { sendEmailsOfOrderMessages } from '~/team-accounts/src/server/actions/orders/update/update-order';

import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';
import { Separator } from '@kit/ui/separator';

const ActivityPage = () => {
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
      if (fileIdsList) {
        await addMessage(messageContent);
        await sendEmailsOfOrderMessages(
          order.id,
          order.title,
          messageContent,
          userWorkspace.name ?? '',
          order?.assigned_to?.map((assignee) => assignee?.agency_member?.email) ??
            [],
           '',
          new Date().toLocaleDateString(),
          userWorkspace.id ?? '',
        );
        for (const fileId of fileIdsList) {
          const { error: Err } = await client
            .from('files')
            .update({
              message_id: messageData.id,
            })
            .eq('id', fileId);
          if (Err) {
            console.error('Error inserting file:', Err);
          }
        }
      } else {
        await addMessage(messageContent);
        await sendEmailsOfOrderMessages(
          order.id,
          order.title,
          messageContent,
          userWorkspace.name ?? '',
          order?.assigned_to?.map((assignee) => assignee?.agency_member?.email) ??
            [],
           '',
          new Date().toLocaleDateString(),
          userWorkspace.id ?? '',
        );
      }
      
    } catch (error) {
      console.error('Failed to send message or upload files:', error);
    }
  };

  return (
    <div className="flex h-full max-h-full w-full flex-col gap-4">
      <Interactions />
      <Separator className='w-full'/>
      <div className="mb-2 flex flex-col justify-end gap-4 border p-2 rounded-lg"> 
        <RichTextEditor
          onComplete={handleOnCompleteMessageSend}
          uploadFileIsExternal
          toggleExternalUpload={() => setShowFileUploader(!showFileUploader)}
          userRole={userRole}
          className='pb-8'
          handleFileIdsChange={handleFileIdsChange}
        />
      </div>
    </div>
  );
};

export default ActivityPage;
