'use client';

import React from 'react';
import * as CheckboxPrimitive from '../../../../../../node_modules/.pnpm/@radix-ui+react-checkbox@1.1.1_@types+react-dom@18.3.0_@types+react@18.3.3_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-checkbox/dist/index';
import { CheckIcon } from '@radix-ui/react-icons';
import { cn } from '../../../../../../packages/ui/src/utils/cn';
import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';
import { getTextColorBasedOnBackground } from '../../../../../../apps/web/app/utils/generate-colors';

interface ThemedCheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  className?: string;
}

export const ThemedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  ThemedCheckboxProps
>(({ className, ...props }, ref) => {
  const { theme_color } = useOrganizationSettings();
  const textColor = getTextColorBasedOnBackground(theme_color ?? '#000000');

  return (
        <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            `peer h-4 w-4 shrink-0 rounded-sm border ${theme_color ? `border-${theme_color}` : 'border-gray-400'} shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[${theme_color}] data-[state=checked]:text-white`,
            className
        )}
        style={{
            '--theme-color': theme_color,
            backgroundColor: props.checked ? theme_color : undefined,
            color: props.checked ? textColor : undefined,
        } as React.CSSProperties}
        {...props}
        >
        <CheckboxPrimitive.Indicator
            className={cn('flex items-center justify-center text-current')}
        >
            <CheckIcon className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
  );
});

ThemedCheckbox.displayName = 'ThemedCheckbox';

export default withOrganizationSettings(ThemedCheckbox);