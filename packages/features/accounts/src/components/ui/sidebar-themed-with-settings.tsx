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
  const defaultBackgroundColor = '#fdfdfd';

  // Provide a default value to prevent undefined
  const effectiveBackgroundColor = sidebar_background_color ? sidebar_background_color : defaultBackgroundColor;
  const textColor = getTextColorBasedOnBackground(effectiveBackgroundColor);

  // Hover item background color
  const hoverItemBackgroundColor = 'rgba(253 253 253 / 0.2)';
  // Hover item color
  const hoverItemColor = getTextColorBasedOnBackground(effectiveBackgroundColor);
  return (
    <Sidebar
      className={` ${className} border-r border-[#EBEBEB]`}
      style={{
        backgroundColor: effectiveBackgroundColor, // Color de fondo por defecto
        color: textColor, // Color de texto por defecto
        boxShadow: 'none', // Sin sombras
      }}
      itemActiveStyle={{
        backgroundColor: theme_color ? theme_color : '#e0e0e0', // Color de fondo activo por defecto
        color: theme_color ? getTextColorBasedOnBackground(theme_color) : getTextColorBasedOnBackground('e0e0e0'), // Color negro por defecto
      }}
      itemHoverStyle={{
        backgroundColor: sidebar_background_color ? hoverItemBackgroundColor : 'rgba(224 224 224 / 0.5)', // 66 is 40% opacity in hex
        color: hoverItemColor,
      }}
      sidebarColor={effectiveBackgroundColor}

      {...rest}
    >
      {children}
    </Sidebar>
  );
};

// Wrapping the ThemedSidebar component with the HOC
const ThemedSidebarWithSettings = withOrganizationSettings(ThemedSidebar);

export default ThemedSidebarWithSettings;
