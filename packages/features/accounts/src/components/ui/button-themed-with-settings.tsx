import React from 'react';

import { Button } from '@kit/ui/button';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';

// Example component that uses organization settings and accepts children for customization
const ThemedButton: React.FC<{
  children: React.ReactNode;
  className: string;
  [key: string]: unknown;
}> = ({ children, className, ...rest }) => {
  const { brandThemeColor } = useOrganizationSettings();
  console.log('brandThemeColor2', brandThemeColor);
  return (
    <Button
      className={`bg-brand flex gap-2 ${className}`}
      style={brandThemeColor ? { backgroundColor: brandThemeColor } : undefined}
      {...rest}
    >
      {children}
    </Button>
  );
};

// Wrapping the ThemedButton component with the HOC
const ThemedButtonWithSettings = withOrganizationSettings(ThemedButton);

export default ThemedButtonWithSettings;
