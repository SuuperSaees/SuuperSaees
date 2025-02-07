'use client';

import { useState, type JSX } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultValues, Path, SubmitHandler, useForm } from 'react-hook-form';
import { ZodType, ZodTypeDef, z } from 'zod';

import { Checkbox } from '@kit/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Spinner } from '@kit/ui/spinner';
import { Plus } from 'lucide-react';

export type Option = {
  value: string;
  label: string;
  actionFn?: (value: string) => void;
};

export interface CustomItemProps<T extends Option> {
  option: T;
}

export type CustomItemComponent<T extends Option> = React.ComponentType<
  CustomItemProps<T>
>;

export interface ComboboxProps<
  TSchema extends ZodType<Record<string, string[]>, ZodTypeDef, unknown>,
> {
  options: Option[];
  defaultValues: DefaultValues<z.infer<TSchema>>;
  schema: TSchema;
  onSubmit: SubmitHandler<z.infer<TSchema>>;
  className?: string;
  customItem?: CustomItemComponent<Option>;
  customItemTrigger?: JSX.Element;
  classNameTrigger?: string;
  values?: string[]; // New prop for controlled values
  isLoading?: boolean;
  onSelect?: (value: string) => void; // New prop for selection handler
  onChange?: (values: string[]) => void; // New prop for change handler
}

export default function CheckboxCombobox<
  TSchema extends ZodType<Record<string, string[]>, ZodTypeDef, unknown>,
>({
  options,
  defaultValues,
  schema,
  onSubmit,
  className,
  customItem: CustomItemComponent,
  customItemTrigger,
  classNameTrigger,
  values, 
  isLoading, 
  onSelect, 
  onChange, 
}: ComboboxProps<TSchema>) {
  const [searchTerm, setSearchTerm] = useState('');
  const form = useForm<z.infer<TSchema>>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePopoverClose = async (open: boolean) => {
    if (!open) {
      const currentValues = form.getValues();
      const hasChanges = Object.keys(currentValues).some(
        (key) =>
          JSON.stringify(currentValues[key]) !==
          JSON.stringify(defaultValues[key]),
      );

      if (hasChanges) {
        await form.handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-8 ${className}`}
      >
        {Object.keys(form.getValues()).map((name) => (
          <FormField
            key={name}
            control={form.control}
            name={name as Path<z.infer<TSchema>>}
            render={({ field }) => (
              <FormItem>
                <Popover onOpenChange={handlePopoverClose}>
                  <PopoverTrigger
                    asChild={customItemTrigger ? false : true}
                    className={classNameTrigger}
                  >
                    {customItemTrigger ? (
                      customItemTrigger
                    ) : (
                      <button className="mr-auto flex h-7 w-7 items-center justify-center rounded-full border-none bg-slate-50 text-2xl font-semibold text-slate-500 transition-transform duration-100 hover:shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="flex w-[300px] flex-col p-4">
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    <div className="no-scrollbar max-h-[250px] overflow-y-auto">
                      { isLoading ? <Spinner className='w-5 h-5 mx-auto' /> :filteredOptions.length ? (
                        filteredOptions.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2 hover:bg-gray-100"
                          >
                            <FormControl>
                              <Checkbox
                                checked={
                                  values
                                    ? values.includes(option.value)
                                    : field.value.includes(option.value)
                                }
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(values ?? field.value), option.value]
                                    : (values ?? field.value).filter(
                                        (value) => value !== option.value,
                                      );
                                  if (onChange) {
                                    onChange(newValue);
                                  } else {
                                    field.onChange(newValue);
                                  }
                                  if (onSelect) {
                                    onSelect(option.value);
                                  }
                                  option.actionFn &&
                                    option.actionFn(option.value);
                                }}
                              />
                            </FormControl>
                            {CustomItemComponent ? (
                              <FormLabel className="h-full w-full font-normal text-gray">
                                <CustomItemComponent option={option} />
                              </FormLabel>
                            ) : (
                              <FormLabel>{option.label}</FormLabel>
                            )}
                          </FormItem>
                        ))
                      ) : (
                        <p className="p-2 text-sm text-gray-500">
                          No results found.
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </form>
    </Form>
  );
}
