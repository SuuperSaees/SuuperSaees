'use client';

import { useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';
import { useInternalMessaging } from './internal-messages-toggle';

interface InternalMessagesButtonProps {
  /**
   * The user's role to determine if they can access internal messaging
   */
  userRole: string;
  /**
   * Array of roles that are allowed to use internal messaging
   * @default ['agency_member', 'agency_project_manager', 'agency_owner', 'project_manager', 'assistant', 'owner']
   */
  allowedRoles?: string[];
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Optional callback when the button is clicked
   */
  onClick?: () => void;
  /**
   * Optional tooltip text
   * @default "Toggle internal messaging"
   */
  tooltipText?: string;
  /**
   * Button variant
   * @default "ghost"
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /**
   * Button size
   * @default "icon"
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * A button component for toggling internal messaging with role-based access control
 */
const InternalMessagesButton = ({
  userRole,
  allowedRoles = ['agency_member', 'agency_project_manager', 'agency_owner'],
  className = '',
  onClick,
  tooltipText = "Toggle internal messaging",
  variant = 'ghost',
  size = 'icon'
}: InternalMessagesButtonProps) => {
  const { isInternalMessagingEnabled, handleSwitchChange } = useInternalMessaging();
  const isAllowed = allowedRoles.includes(userRole);

  const handleClick = useCallback(() => {
    handleSwitchChange();
    if (onClick) onClick();
  }, [handleSwitchChange, onClick]);

  if (!isAllowed) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            className={`${className} ${isInternalMessagingEnabled ? 'text-primary-600' : ''}`}
            aria-label={tooltipText}
          >
            <MessageSquare className={`h-5 w-5 ${isInternalMessagingEnabled ? 'fill-primary-100' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InternalMessagesButton;




