'use client';

import { TabsTrigger } from '@kit/ui/tabs';

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

// Function to convert hex color to rgba with specified opacity
const hexToRgba = (hex: string, opacity: number) => {
  // Remove the hash if present
  hex = hex.replace('#', '');

  // Parse the hex color into RGB
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Return the rgba color string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
// Ensure the component name starts with an uppercase letter
export const ThemedTabTrigger: React.FC<{
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
  value: string;
  activeTab: string;
  option: string;
}> = ({ className, activeTab, option, ...rest }) => {
  // Use the hook correctly inside the component
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(
    hexToRgba(theme_color ?? '', 0.3) ?? '#000000',
  );
  return (
    <TabsTrigger
      className={`hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900 font-semibold hover:bg-gray-50/30 ${className}`}
      style={
        activeTab === option && theme_color
          ? {
              backgroundColor: hexToRgba(theme_color, 0.2), // Apply 0.6 opacity
              color: textColor,
            }
          : undefined
      }
      {...rest}
    >
      {rest.children}
    </TabsTrigger>
  );
};

// Wrap the component with organization settings
const ThemedTabTriggerWithSettings = withOrganizationSettings(ThemedTabTrigger);

export default ThemedTabTriggerWithSettings;
