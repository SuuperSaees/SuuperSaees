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
import { Spinner } from '@kit/ui/spinner';

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
  customItem?: (option: string) => React.ReactNode; // JSX or string for both selected and dropdown items
  children?: React.ReactNode;
  isLoading?: boolean;
  [key: string]: unknown;
}

const SelectAction = ({
  options,
  groupName,
  defaultValue,
  className,
  onSelectHandler,
  customItem,
  children,
  isLoading,
  ...rest
}: SelectActionProps) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const { t } = useTranslation();

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
            {/* Use customItem for the selected value if provided, otherwise show the label */}
            {customItem && selectedValue
              ? customItem(options.find((opt) => opt.value === selectedValue)!.label)
              : selectedLabel ?? t('common:selectOption')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {
            isLoading ? <Spinner className='w-5 h-5 mx-auto' /> :
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value as string}
                className="pointer-events-auto cursor-pointer"
              >
                {/* Use customItem for dropdown items if provided, otherwise show the label */}
                {customItem ? customItem(option.label) : option.label}
              </SelectItem>
            ))}
          </SelectGroup>
          }
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectAction;
