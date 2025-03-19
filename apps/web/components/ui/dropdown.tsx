import React, { useState, useTransition, type JSX } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Separator } from '@kit/ui/separator';

export type DropdownOption = {
  value: string | JSX.Element;
  actionFn: () => Promise<void>;
};
interface DropdownProps {
  children: React.ReactNode;
  options: DropdownOption[];
}
export default function Dropdown({ children, options }: DropdownProps) {
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
      <DropdownMenuTrigger asChild className="w-fit">
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
