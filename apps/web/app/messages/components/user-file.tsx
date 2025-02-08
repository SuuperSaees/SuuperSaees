import { File } from '~/lib/file.types';
import FileWithOptions from '~/orders/[id]/hoc/with-file-options';

interface UserFileProps {
  file: File.Type;
  files: File.Type[];
}

const UserFile = ({ file, files }: UserFileProps) => {
  const renderFilePreview = (file: File.Type) => {
    return (
      <div className="flex flex-col">
        <div className="item-center flex h-[150px] w-[150px] justify-center rounded-lg">
          <FileWithOptions
            src={file.url}
            fileName={file.name}
            fileType={file.type}
            files={files}
          />
        </div>
        <p className="w-[150px] truncate text-sm font-medium text-gray-400">
          {file.name ?? 'fileName'}
        </p>
      </div>
    );
  };

  return <div className="flex">{renderFilePreview(file)}</div>;
};

export default UserFile;
