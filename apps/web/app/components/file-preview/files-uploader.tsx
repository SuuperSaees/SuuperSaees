'use client';

import { useTranslation } from 'react-i18next';

import type { FileUpload } from '../messages/types';
import FileList from './file-list';
import FileUploadDropZone from './file-upload-drop-zone';
import { useFileUploadActions } from './hooks/use-file-upload-actions';

interface FilesUploaderProps {
  bucketName: string;
  path: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (uploads: FileUpload[]) => void;
  onRemoveFile?: (id: string) => void;
}

const FilesUploader = ({
  bucketName,
  path,
  accept,
  multiple = true,
  onFilesSelected,
  onRemoveFile,
}: FilesUploaderProps) => {
  const { t } = useTranslation('files');
  const { fileUploads, handleFiles, handleRemoveFile } = useFileUploadActions({
    bucketName,
    path,
    filePathWithFileName: true,
    onFilesSelected,
    onRemoveFile,
  });

  return (
    <div className="flex flex-col gap-4">
      <FileUploadDropZone
        onFilesSelected={handleFiles}
        accept={accept}
        multiple={multiple}
        placeholder={t('upload.placeholder')}
        dropHereText={t('upload.dropHere')}
      />
      <FileList files={fileUploads} onRemoveFile={handleRemoveFile} />
    </div>
  );
};

export default FilesUploader;
