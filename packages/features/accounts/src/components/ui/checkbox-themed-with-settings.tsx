'use client';

import React from 'react';
import { Checkbox } from '@kit/ui/checkbox';
import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';
import { getTextColorBasedOnBackground } from '../../../../../../apps/web/app/utils/generate-colors';



export const ThemedCheckbox: React.FC<{
    className?: string;
    [key: string]: unknown;
  }> = ({ className, ...rest }) => {
    const { theme_color } = useOrganizationSettings();
    const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');
    return (
         <Checkbox
          className={`flex gap-2 ${className} data-[state=checked]:bg-[${theme_color}] border-gray-400`}
          style={
            theme_color
              ? {
                  color: textColor,
                }
              : undefined
          }
          data-checked-bg={theme_color}
          {...rest}
        />
      );
  };

const ThemedCheckboxWithSettings = withOrganizationSettings(ThemedCheckbox);

export default ThemedCheckboxWithSettings;
