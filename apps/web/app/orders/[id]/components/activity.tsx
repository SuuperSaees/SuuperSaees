'use client';

import UploadFileComponent from '~/components/ui/files-input';
import RichTextEditor from '~/components/ui/rich-text-editor';

import { useActivityContext } from '../context/activity-context';
import Interactions from './interactions';

const ActivityPage = () => {
  const { writeMessage } = useActivityContext();
  return (
    <div className="flex w-full min-w-0 max-w-full max-h-full flex-col gap-4">
      <Interactions />
      <div className="mt-auto flex flex-col gap-4">
        <UploadFileComponent bucketName="orders" />
        <RichTextEditor onComplete={writeMessage} />
      </div>
    </div>
  );
};
export default ActivityPage;
