'use client';

import { useOrganizationSettings } from '../../../../../packages/features/accounts/src/context/organization-settings-context';

interface RadioOptionProps {
  value: string;
  selectedOption: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

function getTextColorBasedOnBackground(backgroundColor: string) {
  const color = backgroundColor.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 186 ? 'black' : 'white';
}

export function RadioOption({ value, selectedOption, onChange, label }: RadioOptionProps) {
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');

  return (
    <label className="flex items-center gap-2 justify-center">
      <input
        type="radio"
        value={value}
        checked={selectedOption === value}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center ${
          selectedOption === value ? `bg-brand border-none` : 'border-gray-400'
        }`}
        style={
          theme_color 
            ? { backgroundColor: selectedOption === value ? theme_color : 'transparent', color: textColor } 
            : undefined
          }
      >
        {selectedOption === value && (
          <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
        )}
      </div>
      <span className="text-gray-700 font-medium text-sm font-inter">{label}</span>
    </label>
  );
}
