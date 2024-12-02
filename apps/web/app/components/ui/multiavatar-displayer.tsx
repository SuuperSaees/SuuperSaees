/**
 * Displays multiple avatars in a row.
 *
 * @param {MultiAvatarDisplayerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
// if avatars length is greater than maxAvatars props, show a circle with bg gray with the remaining avatars (eg. +5)
import { withDropdown } from '~/hocs/with-dropdown';
import AvatarDisplayer from './avatar-displayer';
import { z } from 'zod';

export type Avatar = {
  name: string;
  email: string;
  picture_url?: string | null;
};

interface MultiAvatarDisplayerProps {
  avatars: Avatar[];
  maxAvatars?: number;
  className?: string;
  avatarClassName?: string;
  overlap?: number;
  onHoverAdd?: () => void;
  [key: string]: unknown;
}

export default function MultiAvatarDisplayer({
  avatars,
  maxAvatars = 4,
  className,
  avatarClassName,
  customItemTrigger,
  onHoverAdd,
  ...rest
}: MultiAvatarDisplayerProps & {
  customItemTrigger?: JSX.Element;
}) {
  const overlap = 16; // Amount of overlap between avatars in pixels

  return (
    <div className={`relative flex items-center ${className}`} {...rest}>
      {avatars.slice(0, maxAvatars).map((avatar, index) => (
        <AvatarDisplayer
          pictureUrl={avatar?.picture_url ?? ''}
          displayName={avatar?.name}
          key={index + avatar?.name}
          className={`h-8 w-8 border-2 border-white ${avatarClassName}`}
          style={{
            marginLeft: index === 0 ? 0 : `${-overlap}px`,
            zIndex: maxAvatars - index,
          }}
        />
      ))}

      { customItemTrigger ? (
        <div
          className="relative flex items-center justify-center"
          style={{ marginLeft: `${overlap / 2}px`, zIndex: 1 }}
        >
          {customItemTrigger}
        </div>
      ) : (
        avatars.length > maxAvatars && (
          <div
            onMouseEnter={onHoverAdd}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 font-bold text-sm text-gray-600"
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