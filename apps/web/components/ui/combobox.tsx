'use client';

import { useState, useEffect } from 'react';

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

export type BaseOption = {
  value: string;
  label: string;
  actionFn?: () => void;
  [key: string]: unknown; // Allow any additional properties
};

interface ComboboxProps<T extends BaseOption = BaseOption> {
  options: T[];
  title?: string;
  className?: string;
  resetOnSelect?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  // Custom render functions
  renderTrigger?: (selectedOption: T | null, hasTitle: boolean) => React.ReactNode;
  renderItem?: (option: T, isSelected: boolean) => React.ReactNode;
  // Custom styling
  triggerClassName?: string;
  contentClassName?: string;
  width?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function Combobox<T extends BaseOption = BaseOption>({
  options,
  title,
  resetOnSelect,
  className,
  triggerClassName,
  contentClassName,
  width = 'w-[200px]',
  placeholder = 'Select option...',
  searchPlaceholder = 'Search option...',
  emptyMessage = 'No option found.',
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  renderTrigger,
  renderItem,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(controlledValue ?? defaultValue);

  // Sync internal state with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  const isValueMatching = (value: string, option: string) => {
    return value.trim().toLowerCase() === option.trim().toLowerCase();
  };

  const selectedOption = value 
    ? options.find((option) => isValueMatching(option.value, value)) ?? null
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            `gap-1 flex ${width} items-center justify-between`,
            triggerClassName,
            className
          )}
        >
          {renderTrigger ? (
            renderTrigger(selectedOption, !!title)
          ) : title ? (
            <>
              <PlusIcon className="h-5" />
              <span>{title}</span>
            </>
          ) : selectedOption ? (
            selectedOption.label
          ) : (
            placeholder
          )}

          <ChevronsUpDown className="ml-2 ml-auto h-4 w-4 shrink-0 justify-self-end opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(width, 'p-0', contentClassName)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = isValueMatching(value, option.value);
                
                return (
                  <CommandItem
                    className="cursor-pointer"
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue: string) => {
                      const newValue = currentValue === value ? '' : currentValue;
                      
                      if (!resetOnSelect) {
                        setValue(newValue);
                      }
                      
                      setOpen(false);
                      
                      // Call the onChange callback for react-hook-form integration
                      onValueChange?.(newValue);
                      
                      // Call the action function if provided
                      option.actionFn?.();
                    }}
                  >
                    {renderItem ? (
                      renderItem(option, isSelected)
                    ) : (
                      <>
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {option.label}
                      </>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
