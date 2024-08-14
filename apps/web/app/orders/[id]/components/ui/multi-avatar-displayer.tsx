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
// if avatars length is greater than maxAvatars props, show a circle with bg gray with the remaining avatars (eg. +5)
const MultiAvatarDisplayer = ({
  avatars,
  maxAvatars = 5,
  className,
}: MultiAvatarDisplayerProps) => {
  return (
    <div className={`relative flex items-center ${className} w-fit`}>
      {avatars.slice(0, maxAvatars).map((avatar, index) => (
        <AvatarDisplayer
          pictureUrl={avatar.picture_url}
          displayName={null}
          key={index + avatar.name}
          status={avatar.status}
          className={'h-8 w-8 border-2 border-white'}
          style={{
            position: 'relative',
            left: index === 0 ? 0 : `-${index * 33.33}%`,
            zIndex: maxAvatars - index,
          }}
        />
      ))}
      {avatars.length > maxAvatars && (
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 font-bold`}
          style={{
            position: 'relative',
            right: `${33.33}%`,
            zIndex: maxAvatars,
          }}
        >
          +{avatars.length - maxAvatars}
        </div>
      )}
    </div>
  );
};

export default MultiAvatarDisplayer;