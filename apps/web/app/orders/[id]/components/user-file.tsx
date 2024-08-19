import { File } from '../context/activity-context';
import { formatDateToString } from '../utils/get-formatted-dates';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserFileProps {
  file: File;
}

const UserFile = ({ file }: UserFileProps) => {
  return (
    <div className="flex gap-1">
      <AvatarDisplayer
        displayName={null}
        pictureUrl={file?.user?.picture_url}
        status="online"
      />
      <div className="flex flex-col gap-1">
        <div className="flex w-full justify-between gap-4">
          <span className="font-semibold">{file?.user?.name}</span>
          <small className="text-gray-400">
            {formatDateToString(new Date(file.created_at), 'short')}
          </small>
        </div>

        <div className="flex max-h-72 w-full max-w-full flex-wrap gap-4 overflow-hidden rounded-md">
          {/*eslint-disable @next/next/no-img-element */}
          {/*conditional rendering must be added */}
          <img
            src={file?.url}
            alt="image"
            className="aspect-square h-full w-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default UserFile;
