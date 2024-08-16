'use client';

import { ProfileAvatar } from '@kit/ui/profile-avatar';


interface AvatarDisplayerProps {
  displayName?: string | null;
  pictureUrl?: string | null;
  nickname?: string;
  status?: 'online' | 'offline';
  className?: string;
  [key: string]: unknown;
}
const AvatarDisplayer = ({
  pictureUrl,
  displayName,
  nickname,
  status,
  className,
  ...rest
}: AvatarDisplayerProps) => {
  return (
    <div className={`relative flex h-fit w-fit items-start gap-2`}>
      <ProfileAvatar
        displayName={!displayName ? null : displayName}
        pictureUrl={pictureUrl}
        className={`relative ${
          status
            ? 'after:absolute after:bottom-[1%] after:right-[5%] after:z-[1000] after:h-3 after:w-3 after:rounded-full after:border-2 after:border-white'
            : ''
        } ${status === 'online' ? 'after:bg-green-400' : 'after:bg-gray-400'} ${className} `}
        {...rest}
      />
      <div className="flex flex-col">
        {displayName && (
          <span className="text-sm font-semibold">{displayName}</span>
        )}
        {nickname && <span className="text-sm text-gray-600">{nickname}</span>}
      </div>
    </div>
  );
};
export default AvatarDisplayer;