'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@kit/ui/avatar';

interface AvatarDisplayerProps {
  displayName?: string | null;
  isAssignedOrFollower?: boolean;
  pictureUrl?: string | null;
  nickname?: string;
  status?: 'online' | 'offline';
  className?: string;
  organizationName?: string;
  [key: string]: unknown;
  fallbackInitials?: string;
}
const AvatarDisplayer = ({
  pictureUrl,
  displayName,
  organizationName,
  isAssignedOrFollower,
  nickname,
  status,
  className,
  ...rest
}: AvatarDisplayerProps) => {
  return (
    <div className={`relative flex h-fit w-fit items-center gap-2 ${isAssignedOrFollower ? "scale-75 bg-slate-50 px-4 rounded-full" : ""}`}>
      {/* <ProfileAvatar
        displayName={!displayName ? null : displayName}
        pictureUrl={pictureUrl}
        className={`relative ${
          status
            ? 'after:absolute after:bottom-[1%] after:right-[5%] after:z-[1000] after:h-3 after:w-3 after:rounded-full after:border-2 after:border-white'
            : ''
        } ${status === 'online' ? 'after:bg-green-400' : 'after:bg-gray-400'} ${className} `}
        {...rest}
      /> */}
      <Avatar className={`${isAssignedOrFollower ? "scale-75" : ""}`}>
        <AvatarImage src={pictureUrl} />
        {/* <AvatarFallback>{displayName}</AvatarFallback> */}
        {displayName && (
          <AvatarFallback>
            {displayName ? displayName.charAt(0).toUpperCase() : 'N/A'}
          </AvatarFallback>
        )}
        {nickname && (
          <AvatarFallback>
            {nickname ? nickname.charAt(0).toUpperCase() : 'N/A'}
          </AvatarFallback>
        )}
      </Avatar>
      <div className={`${organizationName ? "grid grid-rows-2 grid-cols-1" : "flex py-2 justify-center items-center"}`}>
        {displayName && <span className="whitespace-nowrap text-sm font-semibold">{displayName}</span>}
        {/* {nickname && <span className="text-sm text-gray-600">{nickname}</span>} */}
        {/* <AvatarFallback>SD</AvatarFallback> */}
      {organizationName && <span className="text-sm text-gray-600">{organizationName}</span>}
      </div>
    </div>
  );
};
export default AvatarDisplayer;