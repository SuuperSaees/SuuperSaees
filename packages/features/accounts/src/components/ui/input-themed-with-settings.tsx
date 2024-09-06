'use client';

import { Input } from '@kit/ui/input';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';

// Ensure the component name starts with an uppercase letter
export const ThemedInput: React.FC<{
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}> = ({ className, ...rest }) => {
  // Use the hook correctly inside the component
  const { theme_color } = useOrganizationSettings();

  return (
    <Input
      className={`focus-visible:ring-none focus-visible:ring-0 ${className}`}
      style={theme_color ? { outlineColor: theme_color } : undefined}
      {...rest}
    />
  );
};

// Wrap the component with organization settings
const ThemedInputWithSettings = withOrganizationSettings(ThemedInput);

export default ThemedInputWithSettings;
