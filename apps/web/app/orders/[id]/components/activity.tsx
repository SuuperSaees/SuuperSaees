'use client';

import { useState } from 'react';



// import { updateFile } from 'node_modules/@kit/team-accounts/src/server/actions/files/update/update-file';
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
  // const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);

  const handleFileIdsChange = async (fileIds: string[]) => {
    // setUploadedFileIds(fileIds);

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

  const { writeMessage } = useActivityContext();

  const handleOnCompleteMessageSend = async (messageContent: string) => {
    try {
      // Step 1: Create the message and get the messageId
      await writeMessage(messageContent);

      // // Step 2: If files are uploaded, update them with the message_id
      // if (uploadedFileIds.length > 0) {
      //   const filesToUpdate = uploadedFileIds.map((fileId) => ({
      //     id: fileId,
      //     message_id: newMessage.id,
      //   }));
      //   // console.log('Files to update:', filesToUpdate);
      //   for (const fileToUpdate of filesToUpdate) {
      //     await updateFile(fileToUpdate.id, fileToUpdate.message_id);
      //   }

      // Update files in the database with the message_id

      // Optionally: Update the UI to replace placeholders with actual files
      // updateFilesInUI(newMessage.id, updatedFiles);
      // }
    } catch (error) {
      console.error('Failed to send message or upload files:', error);
    }
  };

  return (
    <div className="flex h-full w-full min-w-0 max-w-full flex-col gap-4">
      <Interactions />
      <div className="mt-auto flex h-fit flex-grow flex-col gap-4">
        {showFileUploader && (
          <UploadFileComponent
            bucketName="orders"
            onFileIdsChange={handleFileIdsChange}
            uuid={generateUUID()}
          />
        )}
        <RichTextEditor
          onComplete={handleOnCompleteMessageSend} // Update this to call your new function
          uploadFileIsExternal
          toggleExternalUpload={() => setShowFileUploader(!showFileUploader)}
        />
      </div>
    </div>
  );
};
export default ActivityPage;