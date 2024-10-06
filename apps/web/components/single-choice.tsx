import React from 'react';
import { RadioOption } from './options';

interface RadioOptionsProps {
  options: { value: string; label: string }[];
  selectedOption: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioOptions: React.FC<RadioOptionsProps> = ({ options, selectedOption, onChange }) => (
  <>
    {options.map(option => (
      <RadioOption
        key={option.value}
        value={option.value}
        selectedOption={selectedOption}
        onChange={onChange}
        label={option.label}
      />
    ))}
  </>
);

export default RadioOptions;
