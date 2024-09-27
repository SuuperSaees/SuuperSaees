import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Separator } from '@kit/ui/separator';

export type DropdownOption = {
  value: string | JSX.Element;
  actionFn: () => void;
};
interface DropdownProps {
  children: React.ReactNode;
  options: DropdownOption[];
}
export default function Dropdown({ children, options }: DropdownProps) {
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
              className="min-w-32 cursor-pointer"
              onClick={option.actionFn}
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
