import React, { ReactNode } from 'react';

import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as TooltipUI,
} from '@kit/ui/tooltip';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  delayDuration?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  delayDuration,
  children,
  className,
}) => {
  return (
    <TooltipProvider>
      <TooltipUI delayDuration={delayDuration ?? 300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        <TooltipContent className={className}>{content}</TooltipContent>
      </TooltipUI>
    </TooltipProvider>
  );
};

export default Tooltip;
