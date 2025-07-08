'use client';

import React, { useState, useEffect } from 'react';
import { getTextColorBasedOnBackground } from '~/utils/generate-colors';
import { useOrganizationSettings } from '../../../packages/features/accounts/src/context/organization-settings-context';
import { useTranslation } from 'react-i18next';

// Helper functions for managing the "other" option
const OTHER_OPTION_PREFIX = 'suuper-custom';

const isOtherOption = (label: string): boolean => {
  return label.startsWith(OTHER_OPTION_PREFIX);
};

const getDisplayLabel = (label: string, t: (key: string) => string): string => {
  if (isOtherOption(label)) {
    return t('creation.form.marks.other_option_label');
  }
  return label;
};

interface RadioOptionProps {
  value: string;
  selectedOption: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  onCustomValueChange?: (value: string, customText: string) => void;
  allOptionValues?: string[]; // Add this to help determine if selectedOption is custom text
  className?: string;
}

export function RadioOption({ value, selectedOption, onChange, label, onCustomValueChange, allOptionValues, className }: RadioOptionProps) {
  const { t } = useTranslation(['common', 'briefs']);
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');
  const [customText, setCustomText] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const isOther = isOtherOption(label);
  
  // Simple selection logic
  const isSelected = isOther ? isOtherSelected : selectedOption === value;

  // Handle initialization and updates for "other" options
  useEffect(() => {
    if (isOther) {
      // Only select "other" if the selectedOption is actually custom text or explicitly this value
      const shouldBeSelected = Boolean(
        selectedOption === value || 
        (allOptionValues && selectedOption && selectedOption !== '' && selectedOption !== null && !allOptionValues.includes(selectedOption))
      );
      
      setIsOtherSelected(shouldBeSelected);
      
      // If selected and has custom text, set it
      if (shouldBeSelected && selectedOption && selectedOption !== value) {
        setCustomText(selectedOption);
      } else if (!shouldBeSelected) {
        // Clear custom text when not selected
        setCustomText('');
      }
    } else {
      // For non-other options, clear any other state
      setIsOtherSelected(false);
      setCustomText('');
    }
  }, [isOther, selectedOption, value, allOptionValues]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isOther) {
      setIsOtherSelected(true);
      // If there's already custom text, send it; otherwise send the value
      if (customText && onCustomValueChange) {
        onCustomValueChange(value, customText);
      } else {
        onChange(event);
      }
    } else {
      // Clear other option state when selecting a different option
      setIsOtherSelected(false);
      setCustomText('');
      onChange(event);
    }
  };

  const handleCustomTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomText = event.target.value;
    setCustomText(newCustomText);
    
    // Always update when text changes for "other" options
    if (isOther && onCustomValueChange) {
      onCustomValueChange(value, newCustomText);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className={`flex items-center gap-2 w-fit text-sm font-medium  ${className} `}>
      <input
        type="radio"
        value={value}
          checked={isSelected}
          onChange={handleRadioChange}
        className="hidden"
      />
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isSelected ? `bg-brand border-none` : 'border-gray-400'
        }`}
        style={
          theme_color 
              ? { backgroundColor: isSelected ? theme_color : 'transparent', color: textColor } 
            : undefined
          }
      >
          {isSelected && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
      </div>
        <span className="text-gray-500 font-inter leading-6">
          {getDisplayLabel(label, t)}
        </span>
    </label>
      
      {isOther && isSelected && (
        <input
          type="text"
          value={customText}
          onChange={handleCustomTextChange}
          placeholder={t('pleaseSpecify')}
          className="ml-7 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );
}
