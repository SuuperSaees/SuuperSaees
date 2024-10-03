import { format } from 'date-fns';
import { DownloadIcon, StickyNote } from 'lucide-react';

import { File } from '../context/activity-context';
import ImageWithOptions from '../hoc/with-image-options';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserFileProps {
  file: File;
}

const fileTypeColors: Record<string, string> = {
  pdf: 'fill-pdf',
  png: 'fill-png',
  jpg: 'fill-jpg',
  jpeg: 'fill-jpeg',
  doc: 'fill-doc',
  docx: 'fill-docx',
};

const getFileTypeClass = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return fileTypeColors[extension] ?? 'fill-unknown';
};

const UserFile = ({ file }: UserFileProps) => {
  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <ImageWithOptions
          src={file?.url}
          alt="image"
          bucketName="orders"
          className="object-cover" // For the thumbnail
          dialogClassName="object-contain" // For the dialog
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video className="w-full max-w-[400px] rounded-lg" controls>
          <source src={file.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <a className="flex items-center space-x-2" href={file.url}>
          <div className="relative flex items-center justify-center">
            <StickyNote
              className={`text-white ${getFileTypeClass(file.name)} h-[56px] w-[40px]`}
            />
            <span className="absolute inset-0 flex items-end justify-center py-4 text-[9px] font-semibold text-white">
              {file.name.split('.').pop()?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-400">{file.name}</span>
          <DownloadIcon className="h-4 w-4 text-gray-400" />
        </a>
      );
    } else {
      return (
        <a className="flex items-center space-x-2" href={file.url}>
          <div className="relative flex items-center justify-center">
            <StickyNote
              className={`text-white ${getFileTypeClass(file.name)} h-[56px] w-[40px]`}
            />
            <span className="absolute inset-0 flex items-end justify-center py-4 text-[9px] font-semibold text-white">
              {file.name.split('.').pop()?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-400">{file.name}</span>
          <DownloadIcon className="h-4 w-4 text-gray-400" />
        </a>
      );
    }
  };

  return (
    <div className="flex gap-4 w-full">
      <AvatarDisplayer
        displayName={file?.user?.picture_url ? null : file?.user?.name}
        pictureUrl={file?.user?.picture_url}
        text={file?.user.name ? file.user.name : undefined}
      />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex w-full justify-between gap-4">
          <span className="font-semibold">{file?.user?.name}</span>
          <small className="text-gray-400">
            {format(new Date(file?.created_at), 'MMM dd, p')}
          </small>
        </div>

        <div className="flex max-h-72 w-fit max-w-full flex-wrap gap-4 overflow-hidden rounded-md">
          {renderFilePreview(file)}
        </div>
      </div>
    </div>
  );
};

export default UserFile;