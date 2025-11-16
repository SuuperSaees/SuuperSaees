import React from 'react';
import { RadioOption } from './filter-option-files';

interface RadioOptionsProps {
  options: { value: string; label: string }[];
  selectedOption: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioOptions: React.FC<RadioOptionsProps> = ({ options, selectedOption, onChange }) => (
  <div className='flex gap-4 items-center'>
    {options.map(option => (
      <RadioOption
        key={option.value}
        value={option.value}
        selectedOption={selectedOption}
        onChange={onChange}
        label={option.label}
      />
    ))}
  </div>
);

export default RadioOptions;
