'use client';

import { Textarea } from '@kit/ui/textarea';

import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';

// Ensure the component name starts with an uppercase letter
export const ThemedTextarea: React.FC<{
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}> = ({ className, ...rest }) => {
  // Use the hook correctly inside the component
  const { brandThemeColor } = useOrganizationSettings();

  return (
    <Textarea
      className={`focus-visible:ring-none focus-visible:ring-0 ${className}`}
      style={brandThemeColor ? { outlineColor: brandThemeColor } : undefined}
      {...rest}
    />
  );
};

// Wrap the component with organization settings
const ThemedTextareaWithSettings = withOrganizationSettings(ThemedTextarea);

export default ThemedTextareaWithSettings;
