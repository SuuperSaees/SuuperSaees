'use client';

import React from 'react';

import { Sidebar } from '@kit/ui/sidebar';

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
export const ThemedSidebar: React.FC<{
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}> = ({ children, className, ...rest }) => {
  const { sidebar_background_color, theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(
    sidebar_background_color ?? '#ffffff',
  );
  return (
    <Sidebar
      className={` ${className}`}
      style={
        sidebar_background_color
          ? { backgroundColor: sidebar_background_color, color: textColor }
          : undefined
      }
      itemActiveStyle={
        sidebar_background_color
          ? {
              backgroundColor: theme_color,
              color: getTextColorBasedOnBackground(theme_color ?? ''),
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </Sidebar>
  );
};

// Wrapping the ThemedSidebar component with the HOC
const ThemedSidebarWithSettings = withOrganizationSettings(ThemedSidebar);

export default ThemedSidebarWithSettings;
