'use client';

import { getTextColorBasedOnBackground } from '~/utils/generate-colors';
import { useOrganizationSettings } from '../../../packages/features/accounts/src/context/organization-settings-context';

interface RadioOptionProps {
  value: string;
  selectedOption: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  className?: string;
}

export function RadioOption({ value, selectedOption, onChange, label, className }: RadioOptionProps) {
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');

  return (
    <label className={`flex items-center gap-2 w-fit text-md text-4 font-medium  ${className} `}>
      <input
        type="radio"
        value={value}
        checked={selectedOption === value}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selectedOption === value ? `bg-brand border-none` : 'border-gray-400'
        }`}
        style={
          theme_color 
            ? { backgroundColor: selectedOption === value ? theme_color : 'transparent', color: textColor } 
            : undefined
          }
      >
        {selectedOption === value && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
      </div>
      <span className="text-gray-500 font-inter leading-6">{label}</span>
    </label>
  );
}
