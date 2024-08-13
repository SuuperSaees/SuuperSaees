'use client';

import AvatarDisplayer from './avatar-displayer';

type Avatar = {
  name: string;
  email: string;
  picture_url: string;
  status: 'online' | 'offline';
};
interface MultiAvatarDisplayerProps {
  avatars: Avatar[];
  maxAvatars?: number;
  className?: string;
}

/**
 * Displays multiple avatars in a row.
 *
 * @param {MultiAvatarDisplayerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
// if avatars length is greater thant maxAvatars props, show a circle with bg gray with the remaining avatars (eg. +5)
const MultiAvatarDisplayer = ({
  avatars,
  maxAvatars = 5,
  className,
}: MultiAvatarDisplayerProps) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      {avatars.slice(0, maxAvatars).map((avatar, index) => (
        <AvatarDisplayer
          pictureUrl={avatar.picture_url}
          displayName={null}
          key={index + avatar.name}
          status={avatar.status}
          className={`${
            index !== 0 ? `'-left-[40px]'` : '' // if it's not the first avatar, move it to the left by 20px
          }`}
        />
      ))}
      {avatars.length > maxAvatars && (
        <div
          className={`'-left-[3px]'} absolute inline-block flex h-8 w-8 items-center justify-center rounded-full bg-gray-200`}
        >
          +{avatars.length - maxAvatars}
        </div>
      )}
    </div>
  );
};

export default MultiAvatarDisplayer;
