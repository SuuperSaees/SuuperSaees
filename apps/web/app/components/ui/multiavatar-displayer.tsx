/**
 * Displays multiple avatars in a row.
 *
 * @param {MultiAvatarDisplayerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
// if avatars length is greater than maxAvatars props, show a circle with bg gray with the remaining avatars (eg. +5)
import { withDropdown } from '~/hocs/with-dropdown';
import { z } from 'zod';

import type { JSX } from "react";
import Avatar from './avatar';

export type AvatarType = {
  name: string;
  email?: string;
  picture_url?: string | null;
};

interface MultiAvatarDisplayerProps {
  avatars: AvatarType[];
  maxAvatars?: number;
  className?: string;
  avatarClassName?: string;
  overlap?: number;
  blocked?: boolean;
  [key: string]: unknown;
}

export default function MultiAvatarDisplayer({
  avatars,
  maxAvatars = 4,
  className,
  avatarClassName,
  customItemTrigger,
  blocked,
  ...rest
}: MultiAvatarDisplayerProps & {
  customItemTrigger?: JSX.Element;
}) {
  const overlap = 16; // Amount of overlap between avatars in pixels

  return (
    <div className={`relative flex items-center ${className}`} {...rest}>
      {avatars.slice(0, maxAvatars).map((avatar, index) => (
        <Avatar
          src={avatar?.picture_url ?? ''}
          username={avatar?.name}
          key={index + avatar?.name}
          alt={avatar?.name}
          className={` border-2 border-white ${avatarClassName}`}
          style={{
            marginLeft: index === 0 ? 0 : `${-overlap}px`,
            zIndex: maxAvatars + index,
          }}
        />
      ))}
      

      { (customItemTrigger && !blocked) ? (
        <div
          className="relative flex items-center justify-center"
          style={{ marginLeft: `${overlap / 8}px`, zIndex: 1 }}
        >
          {customItemTrigger}
        </div>
      ) : (
        avatars.length > maxAvatars && (
          <div
            className={`flex items-center justify-center rounded-full border-2 border-white bg-gray-200 font-bold text-sm text-gray-600  ${avatarClassName?.includes('w-') ? avatarClassName : 'w-8 h-8'}`}
            style={{
              marginLeft: `${overlap / 2}px`,
              zIndex: 1,
            }}
          >
            +{avatars.length - maxAvatars}
          </div>
        )
      )}
    </div>
  );
}

// Define the schema type
const schema = z.object({
  members: z.array(z.string()),
});

// Proper type usage with both wrapped props and schema type
export const MultiAvatarDropdownDisplayer = withDropdown<
  MultiAvatarDisplayerProps,
  typeof schema
>(MultiAvatarDisplayer);