'use client';

import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

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
  value: string | number;
};

interface SelectActionProps {
  options: Option[];
  groupName?: string;
  defaultValue?: string | null;
  className?: string;
  onSelectHandler?: (value: string) => void;
  children?: React.ReactNode;
  [key: string]: unknown;
}

const SelectAction = ({
  options,
  groupName,
  defaultValue,
  className,
  onSelectHandler,
  children,
  ...rest
}: SelectActionProps) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const { t } = useTranslation();
  // Set the label based on the defaultValue initially
  useEffect(() => {
    const defaultOption = options.find(
      (option) => option.value === defaultValue,
    );
    setSelectedLabel(defaultOption ? defaultOption.label : null);
  }, [defaultValue, options]);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">
        {children ? children : groupName ? groupName : 'Select an option'}
      </span>
      <Select
        value={selectedValue ?? undefined}
        onValueChange={(value) => {
          const selectedOption = options.find(
            (option) => option.value === value,
          );
          if (selectedOption) {
            setSelectedValue(String(selectedOption.value));
            setSelectedLabel(selectedOption.label);
          }
          onSelectHandler && onSelectHandler(value);
        }}
        {...rest}
      >
        <SelectTrigger className={'w-full border-none bg-black ' + className}>
          <SelectValue placeholder={t('common:selectOption')}>
            {selectedLabel ?? t('common:selectOption')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value as string}
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