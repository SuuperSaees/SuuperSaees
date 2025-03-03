import { File } from '~/lib/file.types';
import FilePreview from '../../../components/file-preview/file-preview';
import { withFileOptions } from '../hoc/with-file-options';
import { getFileType } from '../../../lib/file-types';

interface UserFileProps {
  file: File.Response;
  files: File.Response[];
}

const FilePreviewComponent = withFileOptions(FilePreview);

const UserFile = ({ file, files }: UserFileProps) => {
  const filesToDisplayAsCard = [
    'video',
    'pdf',
    'document',
    'spreadsheet',
    'presentation',
    'other',
  ];
  return (

        <FilePreviewComponent
          src={file.url}
          fileName={file.name}
          fileType={file.type}
          className="max-h-full min-w-40 max-w-80"
          files={files}
          renderAs={filesToDisplayAsCard.includes(getFileType(file.type)) ? 'card' : 'inline'}
        />
  );
};

export default UserFile;