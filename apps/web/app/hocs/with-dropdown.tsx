'use client';

import { ZodType, ZodTypeDef } from 'zod';
import CheckboxCombobox, { ComboboxProps } from '~/components/ui/checkbox-combobox';

export function withDropdown<
  TWrappedProps extends object,
  TSchema extends ZodType<Record<string, string[]>, ZodTypeDef, unknown>,
>(
  WrappedComponent: React.ComponentType<TWrappedProps>,
) {
  return function DropdownWrapper({
    options,
    schema,
    onSubmit,
    defaultValues,
    customItem,
    customItemTrigger,
    isLoading,
    ...wrappedProps
  }: TWrappedProps &
    Pick<
      ComboboxProps<TSchema>,
      'options' | 'schema' | 'onSubmit' | 'defaultValues' | 'customItem' | 'customItemTrigger' | 'isLoading'
    >) {
    return (
      <div className="relative">
        <WrappedComponent
          {...(wrappedProps as TWrappedProps)}
          customItemTrigger={
            <CheckboxCombobox
              options={options}
              schema={schema}
              onSubmit={onSubmit}
              defaultValues={defaultValues}
              customItem={customItem}
              customItemTrigger={customItemTrigger}
              isLoading={isLoading}
              {...wrappedProps}
            />
          }
        />
      </div>
    );
  };
}
