'use client';

import React from 'react';
import { CloudUpload } from 'lucide-react';
import { useOrganizationSettings } from '../../context/organization-settings-context';
import { hexToRgb } from '../../../../../../apps/web/app/utils/generate-colors';


interface ThemedDragDropProps {
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

export const ThemedDragDrop: React.FC<ThemedDragDropProps> = ({
  title,
  description,
  className = '',
  iconClassName = '',
}) => {
  const { theme_color } = useOrganizationSettings();

  return (
    <div 
      className={`w-full h-full p-4 flex flex-col items-center justify-center bg-gray-50 bg-gray-100 ${className}`}
      style={{
        ...(theme_color && {
          borderColor: `rgba(${hexToRgb(theme_color)}, 1)`,
        })
      }}
    >
      <div 
        className={`mb-[12px] flex h-[40px] w-[40px] items-center justify-center rounded-lg p-2 border ${theme_color ? '' : 'border-brand/30'} ${iconClassName}`}
        style={{
          ...(theme_color && {
            borderColor: `rgba(${hexToRgb(theme_color)}, 0.3)`,
          })
        }}
      >
        <CloudUpload 
          className="h-[20px] w-[20px]"
          style={{
            color: theme_color
          }}
        />
      </div>
      <p 
        className="text-sm mb-2"
        style={{ color: theme_color }}
      >
        {title}
      </p>
      <p 
        className="text-center text-xs font-normal"
        style={{ color: theme_color }}
      >
        {description}
      </p>
    </div>
  );
};

export default ThemedDragDrop;