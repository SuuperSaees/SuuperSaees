'use client';

import React, { useState, type JSX } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Separator } from '@kit/ui/separator';
import { cn } from '@kit/ui/utils';

export type DropdownOption = {
  value: string | JSX.Element;
  actionFn: () => void | Promise<void>;
  closeOnClick?: boolean;
  includeSeparator?: boolean;
};

interface DropdownProps {
  children: React.ReactNode;
  options: DropdownOption[];
  className?: string
  contentClassName?: string
  showSeparators?: boolean;
}

export default function Dropdown({ children, options, className, contentClassName, showSeparators = true }: DropdownProps) {
  const [open, setOpen] = useState(false);

  const isLinkElement = (value: string | JSX.Element): boolean => {
    if (typeof value !== 'object' || !React.isValidElement(value)) {
      return false;
    }
    
    const props = value.props as Record<string, unknown>;
    return props && typeof props === 'object' && 'href' in props;
  };

  const handleClick = async (option: DropdownOption) => {



     await option.actionFn();

  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className={cn('w-fit', className)}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={contentClassName}>
        {options.map((option, index) => {
          const isLink = isLinkElement(option.value);
          
          return (
            <React.Fragment
              key={
                typeof option.value === 'string'
                  ? option.value + index
                  : 'opt' + index
              }
            >
              <DropdownMenuItem
                className={cn(
                  "min-w-32 cursor-pointer",

                )}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await handleClick(option);
                }}
                onSelect={(e) => {
                  e.stopPropagation();
                  if (isLink) {
                    e.preventDefault();
                  }
                }}
              >
                {option.value}
              </DropdownMenuItem>
              {option.includeSeparator  &&  !showSeparators && <Separator className='my-2'/>}
              {showSeparators && index < options.length - 1 && <Separator />}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
