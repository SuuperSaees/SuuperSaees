'use client';

import { useState } from 'react';



import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';


type Option = {
  label: string;
  value: string;
};

interface SelectActionProps {
  options: Option[];
  groupName?: string;
  defaultValue?: string | null;
  className?: string;
  onSelectHandler?: (value: string) => void;
  [key: string]: unknown
}
const SelectAction = ({
  options,
  groupName,
  defaultValue,
  className,
  onSelectHandler,
  ...rest
}: SelectActionProps) => {
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">
        {groupName ? groupName : 'Select an option'}
      </span>
      <Select
        {...rest}
        value={!selectedOption ? undefined : selectedOption}
        onValueChange={(value) => {
          setSelectedOption(value);
          onSelectHandler && onSelectHandler(value);
        }}
      >
        <SelectTrigger
          className={'w-[180px] border-none bg-black ' + className}
        >
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