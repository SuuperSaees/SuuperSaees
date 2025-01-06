'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@kit/ui/avatar';
import { User } from 'lucide-react';

interface AvatarDisplayerProps {
  isTask?: boolean;
  displayName?: string | null;
  isAssignedOrFollower?: boolean;
  pictureUrl?: string | null;
  nickname?: string;
  // status?: 'online' | 'offline'; this is not used anywhere for now
  className?: string;
  organizationName?: string;
  isClientGuest?: boolean;
  [key: string]: unknown;
  fallbackInitials?: string;
}
const AvatarDisplayer = ({
  isTask = false,
  pictureUrl,
  displayName,
  organizationName,
  isAssignedOrFollower,
  nickname,
  // status, this is not used anywhere for now
  className,
  isClientGuest,
  ...rest
}: AvatarDisplayerProps) => {
  return (
    <div className={`relative flex ${!isTask ? "h-fit w-fit": ""} items-center ${isAssignedOrFollower && !isTask ? "bg-slate-50 pl-2 pr-4 rounded-full" : ""} ${className}`} {...rest}>
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
      <Avatar className={`${isAssignedOrFollower ? "scale-75" : ""} `}>
        {
          isClientGuest ? (
            <User />
          ) : (
            <AvatarImage src={pictureUrl ?? ''} />
          )
        }
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
      {!isTask && 
        <div className={`${organizationName ? "grid grid-rows-2 grid-cols-1" : "flex py-2 justify-center items-center"}`}>
          {displayName && isAssignedOrFollower && <span className="whitespace-nowrap text-sm font-semibold">{displayName}</span>}
          {/* {nickname && <span className="text-sm text-gray-600">{nickname}</span>} */}
          {/* <AvatarFallback>SD</AvatarFallback> */}
          {organizationName && <span className="text-sm text-gray-600">{organizationName}</span>}
        </div>
      }
      
    </div>
  );
};
export default AvatarDisplayer;