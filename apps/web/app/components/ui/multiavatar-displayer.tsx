import { withDropdown } from '~/(main)/hocs/with-dropdown';
import type { JSX } from "react";
import Avatar from './avatar';
import { z } from 'zod';

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
  overlap = 8, // Made overlap configurable with a default value
  ...rest
}: MultiAvatarDisplayerProps & {
  customItemTrigger?: JSX.Element;
}) {
  // Calculate base avatar size from className or use default
  const getAvatarSize = () => {
    if (avatarClassName) {
      const widthMatch = avatarClassName.match(/w-(\d+)/);
      return widthMatch ? parseInt(widthMatch[1] ?? '32') : 32;
    }
    return 32;

  };

  // Calculate negative margin based on avatar size
  const calculateMargin = (index: number) => {
    if (index === 0) return 0;
    const size = getAvatarSize();
    return -(size * (overlap / 32)); // Adjusted calculation for more natural spacing
  };

  return (
    <div className={`relative flex items-center ${className}`} {...rest}>
      {avatars.slice(0, maxAvatars).map((avatar, index) => (
        <div
          key={index + avatar?.name}
          style={{
            marginLeft: `${calculateMargin(index)}px`,
            zIndex: maxAvatars + index,
          }}
          className="relative"
        >
          <Avatar
            src={avatar?.picture_url ?? ''}
            username={avatar?.name}
            alt={avatar?.name}
            className={`border-2 border-white ${avatarClassName}`}
          />
        </div>
      ))}

      {(customItemTrigger && !blocked) ? (
        <div
          className="relative flex items-center justify-center"
          style={{
            marginLeft: `0px`,
            zIndex: 1
          }}
        >
          {customItemTrigger}
        </div>
      ) : (
        avatars.length > maxAvatars && (
          <div
            className={`flex items-center justify-center rounded-full border-2 border-white bg-gray-200 font-bold text-sm text-gray-600 ${
              avatarClassName?.includes('w-') ? avatarClassName : 'w-8 h-8'
            }`}
            style={{
              marginLeft: `0px`,
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