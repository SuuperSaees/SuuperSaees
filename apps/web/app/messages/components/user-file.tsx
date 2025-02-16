import React from 'react';

import { File } from '~/lib/file.types';

import FilePreview from '../../components/file-preview/file-preview';
import { withFileOptions } from '../../hocs/with-file-options';
import { getFileType } from '../../lib/file-types';

interface UserFileProps {
  file: File.Response & {
    isLoading?: boolean;
  };
}

const FilePreviewComponent = withFileOptions(FilePreview);

const filesToDisplayAsCard = [
  'video',
  'pdf',
  'document',
  'spreadsheet',
  'presentation',
  'other',
];
const UserFile = ({ file }: UserFileProps) => {
  return (
    <FilePreviewComponent
      src={file.url}
      fileName={file.name}
      fileType={file.type}
      className="min-w-40"
      isLoading={file.isLoading}
      renderAs={
        filesToDisplayAsCard.includes(getFileType(file.type))
          ? 'card'
          : 'inline'
      }
    />
  );
};

export default UserFile;
