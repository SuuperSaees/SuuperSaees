'use client';

import { useState } from 'react';



import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import UploadFileComponent from '~/components/ui/files-input';
import RichTextEditor from '~/components/ui/rich-text-editor';

import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';

const ActivityPage = () => {
  const { order } = useActivityContext();
  const client = useSupabase();
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const handleFileIdsChange = async (fileIds: string[]) => {
    setUploadedFileIds(fileIds);
    console.log('Uploaded File IDs:', fileIds);

    const orderFilesToInsert = fileIds.map((fileId) => {
      return {
        order_id: order.uuid,
        file_id: fileId,
      };
    });

    orderFilesToInsert.forEach(async (orderFile) => {
      await client.from('order_files').insert(orderFile);
    });
  };

  const { writeMessage } = useActivityContext();
  return (
    <div className="flex h-full w-full min-w-0 max-w-full flex-col gap-4">
      <Interactions />
      <div className="mt-auto flex h-fit flex-grow flex-col gap-4">
        {showFileUploader && (
          <UploadFileComponent
            bucketName="orders"
            onFileIdsChange={handleFileIdsChange}
            uuid="asdasda3we2"
          />
        )}
        <RichTextEditor
          onComplete={writeMessage}
          uploadFileIsExternal
          toggleExternalUpload={() => setShowFileUploader(!showFileUploader)}
        />
      </div>
    </div>
  );
};
export default ActivityPage;