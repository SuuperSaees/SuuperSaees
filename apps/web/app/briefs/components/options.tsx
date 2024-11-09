'use client';

import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

import { getTextColorBasedOnBackground } from '~/utils/generate-colors';

interface RadioOptionProps {
  value: string;
  selectedOption: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export function RadioOption({
  value,
  selectedOption,
  onChange,
  label,
}: RadioOptionProps) {
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');

  return (
    <label className="flex w-fit items-center justify-center gap-2">
      <input
        type="radio"
        value={value}
        checked={selectedOption === value}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`flex h-[16px] w-[16px] items-center justify-center rounded-full border-2 ${
          selectedOption === value ? `border-none bg-brand` : 'border-gray-300'
        }`}
        style={
          theme_color
            ? {
                backgroundColor:
                  selectedOption === value ? theme_color : 'transparent',
                color: textColor,
              }
            : undefined
        }
      >
        {selectedOption === value && (
          <div className="h-[6px] w-[6px] rounded-full bg-white"></div>
        )}
        {selectedOption !== value && (
          <div className="h-[6px] w-[6px] rounded-full bg-gray-300"></div>
        )}
      </div>
      <span className="text-sm font-medium leading-6 text-gray-600">
        {label}
      </span>
    </label>
  );
}
