import { File } from '../context/activity-context';
import FileWithOptions from '../hoc/with-file-options';

interface UserFileProps {
  file: File;
  files: File[];
}

const UserFile = ({ file, files }: UserFileProps) => {
  const renderFilePreview = (file: File) => {
    return <div className='flex flex-col'>
      <div className='h-[150px] w-[150px] flex item-center justify-center rounded-lg'>
        <FileWithOptions
          src={file.url}
          fileName={file.name}
          fileType={file.type}
          files={files}
        />
      </div>
      <p className="text-sm font-medium text-gray-400 truncate w-[150px]">{file.name ?? 'fileName'}</p>
    </div>
  };

  return (
    <div className="flex mb-10">
      {renderFilePreview(file)}
    </div>
  );
};

export default UserFile;