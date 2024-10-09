'use client';

import { useOrganizationSettings } from "node_modules/@kit/accounts/src/context/organization-settings-context";
import { getTextColorBasedOnBackground } from "~/utils/generate-colors";
interface RadioOptionProps {
  value: string;
  selectedOption: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}



export function RadioOption({ value, selectedOption, onChange, label }: RadioOptionProps) {
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');

  return (
    <label className="flex items-center gap-2 justify-center w-fit">
      <input
        type="radio"
        value={value}
        checked={selectedOption === value}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center ${
          selectedOption === value ? `bg-brand border-none` : 'border-gray-300'
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
        {selectedOption !== value && (
          <div className="w-[6px] h-[6px] bg-gray-300 rounded-full"></div>
        )}
        
      </div>
      <span className="text-gray-700 text-[16px] font-medium leading-[1.5]">{label}</span>
    </label>
  );
}
