import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';

import Tooltip from '~/components/ui/tooltip';

interface AvatarDisplayerProps {
  pictureUrl: string;
  displayName?: string;
  className?: string;
  [key: string]: unknown;
}
export default function AvatarDisplayer({
  displayName,
  pictureUrl,
  className,
  ...rest
}: AvatarDisplayerProps) {
  return (
    <Avatar className={`${className}`} {...rest}>
      <AvatarImage src={pictureUrl} alt="account picture" />
      <Tooltip content={displayName}>
        <AvatarFallback>
          {displayName ? displayName.charAt(0).toUpperCase() : 'N/A'}
        </AvatarFallback>
      </Tooltip>
    </Avatar>
  );
}
