import React from 'react';

import { File } from '~/lib/file.types';

import FilePreview from '../../../../components/file-preview/file-preview';
import { FileViewerMode, withFileOptions } from '../../../../(main)/hocs/with-file-options';
import { getFileType } from '../../../../lib/file-types';

interface UserFileProps {
  file: File.Response & {
    isLoading?: boolean;
  };
  files: File.Type[];
  viewerMode?: FileViewerMode;
  uploadState?: {
    id: string;
    size: number;
    progress: number;
    status: 'uploading' | 'success' | 'error';
  }
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
const UserFile = ({ file, files, uploadState, viewerMode = FileViewerMode.DEFAULT }: UserFileProps) => {
  return (
    <FilePreviewComponent
      file={file}
      src={file.url}
      className="min-w-40"
      isLoading={file.isLoading}
      viewerMode={viewerMode}
      files={files}
      uploadState={uploadState}
      renderAs={
        filesToDisplayAsCard.includes(getFileType(file.type))
          ? 'card'
          : 'inline'
      }
    />
  );
};

export default UserFile;
