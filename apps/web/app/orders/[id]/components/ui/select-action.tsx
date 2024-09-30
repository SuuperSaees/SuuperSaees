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
  label: string | JSX.Element;
  value: string;
};

interface SelectActionProps {
  options: Option[];
  groupName?: string;
  defaultValue?: string | null;
  className?: string;
  getitemClassName: (value: string) => string;
  onSelectHandler?: (value: string) => void;
  [key: string]: unknown;
}
const SelectAction = ({
  options,
  groupName,
  defaultValue,
  className,
  getitemClassName,
  onSelectHandler,
  ...rest
}: SelectActionProps) => {
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  return (
    <div className="flex w-full items-center justify-between">
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
          className={'w-fit rounded-full border-none bg-black ' + className}
        >
          {(groupName === 'Priority' || groupName === 'Prioridad') && (
            <div className="mr-2 h-2 w-2 rounded-full bg-current"></div>
          )}
          <SelectValue placeholder="Select an option" className="m-0 p-0" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup className="flex flex-col gap-2">
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={`pointer-events-auto h-full w-full cursor-pointer ${getitemClassName(option.value ?? '')}`}
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