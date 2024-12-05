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
          const messageData = await writeMessage(messageContent);
          for (const fileId of idsListFromServer) {
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
        } else if (messageContent !== '<p></p>' && idsListFromServer.length === 0) {
          await writeMessage(messageContent);
        }
        
      } else {
        await writeMessage(messageContent);
      }
      
    } catch (error) {
      console.error('Failed to send message or upload files:', error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 h-auto">
      <Separator className='w-full'/>
      <Interactions />
      <Separator className='w-full'/>
      <div className="mb-10 flex flex-col justify-end px-8"> 
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
