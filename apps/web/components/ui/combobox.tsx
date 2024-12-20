'use client';

import { useState } from 'react';

import { Check, ChevronsUpDown, PlusIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@kit/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';

type Option = {
  value: string;
  label: string;
  actionFn: () => void;
};
interface ComboboxProps {
  options: Option[];
  title?: string;
  className?: string;
  resetOnSelect?: boolean;
  defaultValue?: string;
}

export function Combobox({
  options,
  title,
  resetOnSelect,
  className,
  defaultValue = '', // Default to an empty string if not provided
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue); // Initialize with defaultValue

  const isValueMatching = (value: string, option: string) => {
    return value.trim().toLowerCase() === option.trim().toLowerCase();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`gap 1 flex w-[200px] items-center justify-between ${className}`}
        >
          {title ? (
            <>
              <PlusIcon className="h-5" />
              <span>{title}</span>
            </>
          ) : value ? (
            options.find((option) => isValueMatching(option.value, value))
              ?.label
          ) : (
            'Select option...'
          )}

          <ChevronsUpDown className="ml-2 ml-auto h-4 w-4 shrink-0 justify-self-end opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  className="cursor-pointer"
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    if (!resetOnSelect) {
                      setValue(currentValue === value ? '' : currentValue);
                    }
                    setOpen(false);
                    option.actionFn();
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isValueMatching(value, option.value)
                        ? 'opacity-100'
                        : 'opacity-0',
                      '',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
