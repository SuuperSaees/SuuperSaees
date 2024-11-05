'use client';

import React from 'react';

import { Button } from '@kit/ui/button';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';
import { getColorLuminance, hexToRgb } from '../../../../../../apps/web/app/utils/generate-colors';

// Example component that uses organization settings and accepts children for customization
export const ThemedButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  themeColor?: string;
  opacity?: number;
  [key: string]: unknown;
}> = ({ children, className, themeColor, opacity, ...rest }) => {
  const { theme_color } = useOrganizationSettings();
  if (!themeColor) {
    themeColor = theme_color;
  }
  const { theme: baseTextColor, luminance } = getColorLuminance(themeColor ?? '#000000');
  
  let textColor;
  if (opacity) {
    if (luminance < 50) {
      textColor = 'white';
    } else if (luminance > 200) {
      textColor = 'black';
    } else {
      textColor = themeColor;
    }
  } else {
    textColor = baseTextColor;
  }
  return (
    <Button
      className={`bg-brand flex gap-2 ${className}`}
      style={
        themeColor
          ? { backgroundColor: opacity ? `rgba(${hexToRgb(themeColor)}, ${opacity})` : themeColor, color: textColor, borderColor: opacity ? `rgba(${hexToRgb(themeColor)}, ${opacity})` : undefined }
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