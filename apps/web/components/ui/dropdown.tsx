import React, { useState, useTransition, type JSX } from 'react';

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
  actionFn: () => Promise<void>;
};
interface DropdownProps {
  children: React.ReactNode;
  options: DropdownOption[];
  className?: string
}
export default function Dropdown({ children, options, className }: DropdownProps) {
  const [isPending, startTransition] = useTransition();
  const [disabledIndices, setDisabledIndices] = useState<number[]>([]);

  const handleClick = (option: DropdownOption, index: number) => {
    setDisabledIndices((prev) => [...prev, index]);

    startTransition(async () => {
      await option.actionFn().finally(() => {
        setDisabledIndices((prev) => prev.filter((i) => i !== index));
      });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={cn('w-fit', className)}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option, index) => (
          <React.Fragment
            key={
              typeof option.value === 'string'
                ? option.value + index
                : 'opt' + index
            }
          >
            <DropdownMenuItem
              className={`min-w-32 cursor-pointer ${disabledIndices.includes(index) ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => handleClick(option, index)}
              disabled={isPending || disabledIndices.includes(index)}
            >
              {option.value}
            </DropdownMenuItem>
            {index < options.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
