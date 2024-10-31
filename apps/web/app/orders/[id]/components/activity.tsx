'use client';

import { useState } from 'react';



import { useSupabase } from '@kit/supabase/hooks/use-supabase';



import UploadFileComponent from '~/components/ui/files-input';
import RichTextEditor from '~/components/ui/rich-text-editor';



import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';


function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

  const handleOnCompleteMessageSend = async (messageContent: string) => {
    try {
      await writeMessage(messageContent);
    } catch (error) {
      console.error('Failed to send message or upload files:', error);
    }
  };

  return (
<div className="flex w-full flex-col gap-4">
    <Interactions />
    <div className="flex flex-col gap-4 justify-end mb-2">
        {showFileUploader && (
            <UploadFileComponent
                bucketName="orders"
                onFileIdsChange={handleFileIdsChange}
                uuid={generateUUID()}
                removeResults
                toggleExternalUpload={() => setShowFileUploader(!showFileUploader)}
            />
        )}
        <div className="flex-grow" /> 
        <RichTextEditor
            onComplete={handleOnCompleteMessageSend}
            uploadFileIsExternal
            toggleExternalUpload={() => setShowFileUploader(!showFileUploader)}
            userRole={userRole}
        />
    </div>
</div>

  );
};

export default ActivityPage;