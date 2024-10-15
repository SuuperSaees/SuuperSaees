'use client';

import React from 'react';

import { Button } from '@kit/ui/button';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';

function getTextColorBasedOnBackground(backgroundColor: string) {
  // Remove any hash symbol if it exists
  const color = backgroundColor.replace('#', '');

  // Convert the hex color to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate the luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Return 'black' for lighter backgrounds and 'white' for darker backgrounds
  return luminance > 186 ? 'black' : 'white'; // 186 is a common threshold for readability
}
// Example component that uses organization settings and accepts children for customization
export const ThemedButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  themeColor?: string;
  [key: string]: unknown;
}> = ({ children, className, themeColor, ...rest }) => {
  const { theme_color } = useOrganizationSettings();
  if (!themeColor) {
    themeColor = theme_color;
  }
  const textColor = getTextColorBasedOnBackground(themeColor ?? '#000000');
  return (
    <Button
      className={`bg-brand flex gap-2 ${className}`}
      style={
        themeColor
          ? { backgroundColor: themeColor, color: textColor }
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