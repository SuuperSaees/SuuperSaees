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
    <Tooltip content={displayName}>
      <Avatar className={`${className}`} {...rest}>
        <AvatarImage src={pictureUrl} alt="account picture" />
        <AvatarFallback>
          {displayName ? displayName.charAt(0).toUpperCase() : 'N/A'}
        </AvatarFallback>
      </Avatar>
    </Tooltip>
  );
}
