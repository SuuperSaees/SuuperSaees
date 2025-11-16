'use client';

import React from 'react';

import { Button } from '@kit/ui/button';

import {
  getContrastColor,
  hexToRgb,
} from '../../../../../../apps/web/app/utils/generate-colors';
import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';

// Example component that uses organization settings and accepts children for customization
export const ThemedButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  themeColor?: string;
  opacity?: number;
  [key: string]: unknown;
}> = ({ children, className, themeColor, opacity, ...rest }) => {
  const { theme_color } = useOrganizationSettings();

  if (theme_color) {
    themeColor = theme_color;
  }

  const textColor = getContrastColor(themeColor ?? '#85EFFF');

  return (
    <Button
      className={`bg-brand flex gap-1 text-black hover:text-white ${className}`}
      style={
        themeColor
          ? {
              backgroundColor: opacity
                ? `rgba(${hexToRgb(themeColor ?? '#85EFFF')}, ${opacity})`
                : themeColor,
              color: textColor,
              borderColor: opacity
                ? `rgba(${hexToRgb(themeColor ?? '#85EFFF')}, ${opacity})`
                : undefined,
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </Button>
  );
};

// Wrapping the ThemedButton component with the HOC
const ThemedButtonWithSettings = withOrganizationSettings(ThemedButton);

export default ThemedButtonWithSettings;
