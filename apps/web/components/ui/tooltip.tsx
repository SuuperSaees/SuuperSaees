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
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <TooltipProvider>
      <TooltipUI>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        <TooltipContent>{content}</TooltipContent>
      </TooltipUI>
    </TooltipProvider>
  );
};

export default Tooltip;
