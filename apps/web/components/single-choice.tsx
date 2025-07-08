
import React from 'react';
import { RadioOption } from './options';

interface RadioOptionsProps {
  options: { value: string; label: string }[];
  selectedOption: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioOptions: React.FC<RadioOptionsProps> = ({ options, selectedOption, onChange }) => {
  const handleCustomValueChange = (value: string, customText: string) => {
    // For "other" options, only send the custom text as the value
    const syntheticEvent = {
      target: {
        value: customText
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-3">
    {options.map(option => (
      <RadioOption
        key={option.value}
        value={option.value}
        selectedOption={selectedOption}
        onChange={onChange}
        label={option.label}
          onCustomValueChange={handleCustomValueChange}
          allOptionValues={options.map(opt => opt.value)}
      />
    ))}
    </div>
);
};

export default RadioOptions;
