'use client';

import { useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import RichTextEditor from '~/components/ui/rich-text-editor';

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

  const { writeMessage, userRole } = useActivityContext();

  const handleOnCompleteMessageSend = async (messageContent: string, fileIdsList?: string[]) => {
    try {
      if (fileIdsList) {
        const messageData = await writeMessage(messageContent);
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
        await writeMessage(messageContent);
      }
      
    } catch (error) {
      console.error('Failed to send message or upload files:', error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 max-h-full h-full">
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
