import React from 'react';

import { File } from '~/lib/file.types';

import FilePreview from '../../../components/file-preview/file-preview';
import { FileViewerMode, withFileOptions } from '../../hocs/with-file-options';
import { getFileType } from '../../../lib/file-types';
import { FileUploadState } from '~/hooks/use-file-upload';

interface UserFileProps {
  file: File.Response & {
    isLoading?: boolean;
  };
  files: File.Type[];
  viewerMode?: FileViewerMode;
  upload?: FileUploadState;
  enableValidation?: boolean;
  onRemove?: (fileId: string) => void;
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
const UserFile = ({ file, files, viewerMode = FileViewerMode.DEFAULT, upload, enableValidation = false, onRemove }: UserFileProps) => {
  return (
    <FilePreviewComponent
      src={file.url}
      file={file}
      className="min-w-40"
      isLoading={file.isLoading}
      viewerMode={viewerMode}
      files={files}
      renderAs={
        filesToDisplayAsCard.includes(getFileType(file.type))
          ? 'card'
          : 'inline'
      }
      upload={upload}
      enableValidation={enableValidation}
      onRemove={onRemove}
    />
  );
};

export default UserFile;
