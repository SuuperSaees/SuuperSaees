'use client';

import { useState, useEffect, type JSX } from 'react';

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
  showLabel?: boolean
}
const SelectAction = ({
  options,
  groupName,
  defaultValue,
  className,
  getitemClassName,
  onSelectHandler,
  showLabel = true,
  ...rest
}: SelectActionProps) => {
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  useEffect(() => {
    setSelectedOption(defaultValue);
  }, [defaultValue]);

  //Retrieves the label for a given value from the options array
  const getSelectedLabel = (value: string) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : '';
  };

  return (
    <div className={`flex w-full items-center ${showLabel ? 'justify-between' : 'justify-center'}`}>
      <span className="font-semibold">
        {groupName && showLabel ? groupName : showLabel ? 'Select an option' : ''}
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
          className={'w-fit border-none bg-black ' + className}
        >
          {(groupName === 'Priority' || groupName === 'Prioridad') && (
            <div className="mr-2 h-2 w-2 rounded-full bg-current"></div>
          )}
          <SelectValue className="m-0 p-0" >
            {selectedOption ? getSelectedLabel(selectedOption) : 'Select an option'}
          </SelectValue>
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