import React from 'react';
import { RadioOption } from './options';

interface RadioOptionsProps {
  options: { value: string; label: string }[];
  selectedOption: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  useGridLayout?: boolean;
}

const RadioOptions: React.FC<RadioOptionsProps> = ({ 
  options, 
  selectedOption, 
  onChange,
  useGridLayout = false 
}) => (
  <div className={`${
    useGridLayout 
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' 
      : 'flex flex-col gap-4 text-sm'
  }`}>
    {options.map(option => (
      <RadioOption
        key={option.value}
        value={option.value}
        selectedOption={selectedOption}
        onChange={onChange}
        label={option.label}
        className='text-sm'
      />
    ))}
  </div>
);

export default RadioOptions;
