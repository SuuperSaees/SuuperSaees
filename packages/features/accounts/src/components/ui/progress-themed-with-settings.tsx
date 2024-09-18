'use client';

import React from 'react';

import { Progress } from '../../../../../../packages/ui/src/shadcn/progress'; // Ajusta la importación según la biblioteca que estés usando

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
export const ThemedProgress: React.FC<{
  value: number;
  className?: string;
  [key: string]: unknown;
}> = ({ value, className, ...rest }) => {
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');
  return (
    <Progress
      value={value}
      className={`flex gap-2 ${className}`}
      style={
        theme_color
          ? { backgroundColor: theme_color, color: textColor }
          : undefined
      }
      {...rest}
    />
  );
};

// Wrapping the ThemedProgress component with the HOC
const ThemedProgressWithSettings = withOrganizationSettings(ThemedProgress);

export default ThemedProgressWithSettings;
