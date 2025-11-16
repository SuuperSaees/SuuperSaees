'use client';

import { useState } from 'react';



import { TabsTrigger } from '@kit/ui/tabs';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';

// function getTextColorBasedOnBackground(backgroundColor: string) {
//   // Remove any hash symbol if it exists
//   const color = backgroundColor.replace('#', '');

//   // Convert the hex color to RGB
//   const r = parseInt(color.substring(0, 2), 16);
//   const g = parseInt(color.substring(2, 4), 16);
//   const b = parseInt(color.substring(4, 6), 16);

//   // Calculate the luminance
//   const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

//   // Return 'black' for lighter backgrounds and 'white' for darker backgrounds
//   return luminance > 186 ? '#475467' : 'white'; // 186 is a common threshold for readability
// }

// Function to convert hex color to rgba with specified opacity
const hexToRgba = (hex: string, opacity: number) => {
  // Remove the hash if present
  hex = hex.replace('#', '');

  // Parse the hex color into RGB
  // const bigint = parseInt(hex, 16);
  // const r = (bigint >> 16) & 255;
  // const g = (bigint >> 8) & 255;
  // const b = bigint & 255;

  // Convert the opacity (0-1) to a hex value (00-FF)
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  // Return the hex color with the opacity as the alpha channel
  return `#${hex}${alpha}`;
};
// Ensure the component name starts with an uppercase letter
export const ThemedTabTrigger: React.FC<{
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
  value: string;
  activeTab: string;
  option: string;
  withBorder?: boolean;
}> = ({ className, activeTab, option, withBorder,...rest }) => {
  const { theme_color } = useOrganizationSettings();
  // const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');

  // State for hover detection
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TabsTrigger
      className={`hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900 font-semibold ${className} ${withBorder ? 'border-b-2 border-transparent rounded-none data-[state=active]:border-b-brand data-[state=active]:bg-transparent' : ''}`}
      style={
        theme_color
          ? {
              backgroundColor:
                (activeTab === option && !withBorder)
                  ? hexToRgba('#667085', 0.1) // Apply 0.1 opacity if active
                  : (isHovered && !withBorder)
                    ? hexToRgba('#667085', 0.1) // Apply 0.1 opacity on hover
                    : undefined,
              color: '#667085',
              borderColor: (withBorder && activeTab === option ) ? theme_color: undefined,
            }
          : undefined
      }
      onMouseEnter={() => setIsHovered(true)} // Set hover state
      onMouseLeave={() => setIsHovered(false)} // Reset hover state
      {...rest}
    >
      {rest.children}
    </TabsTrigger>
  );
};

// Wrap the component with organization settings
const ThemedTabTriggerWithSettings = withOrganizationSettings(ThemedTabTrigger);

export default ThemedTabTriggerWithSettings;
