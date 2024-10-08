'use client';


import React from 'react';
import { RadioOption } from './options';
import { useTranslation } from 'react-i18next';

interface BriefFormSingleChoiceProps {
  selectedOption: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title : string;
  description : string;
  options: { value: string; label: string }[];
}

const BriefFormSingleChoice: React.FC<BriefFormSingleChoiceProps> = ({ selectedOption, onChange, title, description, options }) => {
  const { t } = useTranslation('briefs');

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex'>
          <input
            type="text"
            value={title}
            disabled={true}
            className="border-none focus:outline-none text-gray-600 text-sm font-medium"
            style={{ width: `${Math.max(title.length, t('singleChoice.title').length) + 1}ch` }}
            placeholder={t('singleChoice.title')}
          />
          <span className='block text-gray-600 text-sm font-medium'>*</span>
      </div>
      <div>
        <input
            type="text"
            value={description}
            disabled={true}
            className="border-none focus:outline-none text-gray-600 text-sm font-medium"
            style={{ width: `${Math.max(description.length, t('singleChoice.description').length) + 1}ch` }}
            placeholder={t('singleChoice.description')}
        />
      </div>
      
      <div className='flex flex-col gap-3 mt-4'>
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
    </div>
  );
};

export default BriefFormSingleChoice;