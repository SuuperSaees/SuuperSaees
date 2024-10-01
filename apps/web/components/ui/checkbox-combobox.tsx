'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
// import { Plus } from 'lucide-react';
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

export type Option = {
  value: string;
  label: string;
  actionFn?: () => void;
};

export interface CustomItemProps<T extends Option> {
  option: T;
}

export type CustomItemComponent<T extends Option> = React.ComponentType<
  CustomItemProps<T>
>;
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ComboboxProps<
  TSchema extends ZodType<Record<string, string[]>, ZodTypeDef, any>,
> {
  options: Option[];
  defaultValues: DefaultValues<z.infer<TSchema>>;
  schema: TSchema;
  onSubmit: SubmitHandler<z.infer<TSchema>>;
  className?: string;
  customItem?: CustomItemComponent<Option>;
}

export default function CheckboxCombobox<
  TSchema extends ZodType<Record<string, string[]>, ZodTypeDef, any>,
>({
  options,
  defaultValues,
  schema,
  onSubmit,
  className,
  customItem: CustomItemComponent,
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
    // console.log('v', defaultValues);
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
                  <PopoverTrigger asChild>
                    {options.length && (
                      <button className="mr-auto flex h-7 w-7 items-center justify-center text-2xl rounded-full font-semibold border-none text-slate-500 bg-slate-50 hover:scale-105 transition-transform duration-100 hover:shadow-sm">
                        +
                      </button>
                    )}
                  </PopoverTrigger>
                  {/* <FormControl>
                    <Input placeholder="Search options..." />
                  </FormControl> */}
                  <PopoverContent className="flex w-[300px] flex-col p-2">
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    {filteredOptions.length ? (
                      filteredOptions.map((option) => (
                        <FormItem
                          key={option.value}
                          className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2 hover:bg-gray-100"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, option.value]
                                  : field.value.filter(
                                      (value) => value !== option.value,
                                    );
                                field.onChange(newValue);
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
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {/* <Button type="submit">Submit</Button> */}
      </form>
    </Form>
  );
}
