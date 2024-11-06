import React, { useState, useEffect, useRef } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@kit/ui/utils";
import { Button } from "@kit/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kit/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kit/ui/popover";

export function Combobox({ options, title, className, resetOnSelect, onSelect }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const [triggerWidth, setTriggerWidth] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    
    resizeObserver.observe(triggerRef.current);

    updateWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  
  useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full", className)}
          ref={triggerRef}
        >
          <div className="flex justify-between w-full">
            {value
              ? options.find((option) => option.value === value)?.label
              : title || "Select..."}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: triggerWidth }}>
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(resetOnSelect ? "" : currentValue);
                    setOpen(false);
                    if (option.actionFn) {
                      option.actionFn();
                    }
                    if (onSelect) {
                      onSelect(option);
                    }
                  }}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}