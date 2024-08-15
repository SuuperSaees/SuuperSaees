'use client';

import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

type Option = {
  label: string;
  value: string;
};

interface SelectActionProps {
  options: Option[];
  groupName?: string;
  defaultValue?: string;
  className?: string;
  onSelectHandler?: (value: string) => void;
}
const SelectAction = ({
  options,
  groupName,
  defaultValue,
  className,
  onSelectHandler,
}: SelectActionProps) => {
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">
        {groupName ? groupName : 'Select an option'}
      </span>
      <Select
        value={selectedOption}
        onValueChange={(value) => {
          setSelectedOption(value);
          onSelectHandler && onSelectHandler(value);
        }}
      >
        <SelectTrigger className={'w-[180px] border-none bg-black ' + className}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="pointer-events-auto cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
export default SelectAction;
