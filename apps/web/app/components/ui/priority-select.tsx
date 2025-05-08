'use client';

import { useEffect, useState } from 'react';

import SelectAction, { Option } from '~/components/ui/select';
import { getPriorityClassName } from '~/(main)/orders/[id]/utils/generate-options-and-classnames';

import PriorityChip from './priority-chip';

interface PrioritySelectProps {
  priority: string;
  options?: Option[];
  className?: string;
  onUpdate?: <T>(priority: string) => Promise<void> | void | Promise<T>;
  isLoading?: boolean;
}

export const PrioritySelect = ({
  priority,
  className,
  options,
  isLoading,
  onUpdate,
}: PrioritySelectProps) => {
  const [selectedPriority, setSelectedPriority] = useState(priority);

  const handleUpdatePriority = async (priority: string | number) => {
    setSelectedPriority(String(priority));
    if (onUpdate) {
      try {
        await onUpdate(String(priority));
      } catch (error) {
        console.error('Error updating priority:', error);
      }
    }
  };

  const defaultOptions = [
    {
      label: 'Low',
      value: 'low',
      action: handleUpdatePriority,
    },
    {
      label: 'Medium',
      value: 'medium',
      action: handleUpdatePriority,
    },
    {
      label: 'High',
      value: 'high',
      action: handleUpdatePriority,
    },
  ];

  useEffect(() => {
    setSelectedPriority(priority);
  }, [priority]);
  return (
    <SelectAction
      className={
        `${getPriorityClassName(selectedPriority ?? '')} ` +
        className +
        ' ml-auto flex h-fit w-fit items-center gap-0 rounded-full border-none py-0 pr-2 shadow-none outline-none focus:border-none focus:ring-0 [&>*]:ml-0'
      }
      options={options ?? defaultOptions}
      defaultValue={selectedPriority}
      customItem={(label) => (
        <PriorityChip
          priority={label}
          className={getPriorityClassName(label.toLowerCase()) + ' px-2'}
        />
      )}
      isLoading={isLoading ?? false}
    />
  );
};

export default PrioritySelect;
