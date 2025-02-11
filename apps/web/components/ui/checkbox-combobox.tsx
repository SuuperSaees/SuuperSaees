'use client';

import {  useEffect, useState, type JSX } from 'react';

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
  value: string
  label: string
  actionFn?: (value: string) => void
}

export interface CustomItemProps<T extends Option> {
  option: T
}

export type CustomItemComponent<T extends Option> = React.ComponentType<CustomItemProps<T>>

export interface ComboboxProps<TSchema extends ZodType<Record<string, string[]>, ZodTypeDef, unknown>> {
  options: Option[]
  defaultValues: DefaultValues<z.infer<TSchema>>
  schema: TSchema
  onSubmit: SubmitHandler<z.infer<TSchema>>
  className?: string
  customItem?: CustomItemComponent<Option>
  customItemTrigger?: JSX.Element
  classNameTrigger?: string
  values?: string[]
  isLoading?: boolean
  onSelect?: (value: string) => void
  onChange?: (values: string[]) => void
  disabled?: boolean
}

export default function CheckboxCombobox<TSchema extends ZodType<Record<string, string[]>, ZodTypeDef, unknown>>({
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
  disabled,
}: ComboboxProps<TSchema>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [formKey, setFormKey] = useState(0) // Add key for form reset

  const form = useForm<z.infer<TSchema>>({
    defaultValues,
    resolver: zodResolver(schema),
  })

  // Reset form when defaultValues change
  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const handlePopoverClose = async (open: boolean) => {
    if (!open) {
      const currentValues = form.getValues()
      const hasChanges = Object.keys(currentValues).some(
        (key) =>
          JSON.stringify(currentValues[key]) !== JSON.stringify(defaultValues[key as keyof typeof defaultValues]),
      )

      if (hasChanges) {
        await form.handleSubmit(onSubmit)()
      }
    }
  }

  // Force form reset if values prop changes
  useEffect(() => {
    if (values !== undefined) {
      const formValues = Object.keys(defaultValues).reduce(
        (acc, key) => {
          acc[key as keyof typeof defaultValues] = values
          return acc
        },
        {} as typeof defaultValues,
      )

      form.reset(formValues)
      setFormKey((prev) => prev + 1) // Force re-render
    }
  }, [values, defaultValues, form])

  return (
    <Form {...form}>
      <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className={`space-y-8 ${className}`}>
        {Object.keys(defaultValues).map((name) => (
          <FormField
            key={name}
            control={form.control}
            name={name as Path<z.infer<TSchema>>}
            render={({ field }) => (
              <FormItem>
                <Popover onOpenChange={handlePopoverClose}>
                  <PopoverTrigger asChild={!customItemTrigger} className={classNameTrigger} disabled={disabled}>
                    {customItemTrigger ? (
                      customItemTrigger
                    ) : (
                      <button
                        type="button"
                        className="mr-auto flex h-7 w-7 items-center justify-center rounded-full border-none bg-slate-50 text-2xl font-semibold text-slate-500 transition-transform duration-100 hover:shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
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
                      {isLoading ? (
                        <Spinner className="mx-auto h-5 w-5" />
                      ) : filteredOptions.length ? (
                        filteredOptions.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2 hover:bg-gray-100"
                          >
                            <FormControl>
                              <Checkbox
                                checked={values ? values.includes(option.value) : field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const currentValues = values ?? field.value ?? []
                                  const newValue = checked
                                    ? [...currentValues, option.value]
                                    : currentValues.filter((value) => value !== option.value)

                                  if (onChange) {
                                    onChange(newValue)
                                  }
                                  field.onChange(newValue)

                                  if (onSelect) {
                                    onSelect(option.value)
                                  }
                                  option.actionFn?.(option.value)
                                }}
                              />
                            </FormControl>
                            {CustomItemComponent ? (
                              <FormLabel className="h-full w-full font-normal">
                                <CustomItemComponent option={option} />
                              </FormLabel>
                            ) : (
                              <FormLabel className="cursor-pointer">{option.label}</FormLabel>
                            )}
                          </FormItem>
                        ))
                      ) : (
                        <p className="p-2 text-sm text-gray-500">No results found.</p>
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
  )
}

