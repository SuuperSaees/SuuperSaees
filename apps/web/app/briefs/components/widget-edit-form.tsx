'use client';

import React, { ChangeEvent, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { useBriefsContext } from '../contexts/briefs-context';
import { widgetEditSchema } from '../schemas/widget-edit-schema';

export function WidgetEditForm() {
  const { currentFormField, updateFormField } = useBriefsContext();

  const { t } = useTranslation('briefs');

  const form = useForm<z.infer<typeof widgetEditSchema>>({
    resolver: zodResolver(widgetEditSchema),
    defaultValues: currentFormField,
    mode: 'onChange',
  });

  const {
    fields: optionsFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  // Helper for updating form and context state
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    form.setValue(name as keyof z.infer<typeof widgetEditSchema>, value);

    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        id: currentFormField.id,
        [name]: value,
      });
    }
  };

  // Submit handler
  const onSubmit = (values: z.infer<typeof widgetEditSchema>) => {
    if (currentFormField) {
      updateFormField(currentFormField.id, { ...currentFormField, ...values });
    }
  };

  // Option rendering helper
  const renderOptionFields = () => (
    <React.Fragment>
      {optionsFields.map((option, index) => (
        <div key={option.id} className="space-y-4">
          {renderFieldInput(`options.${index}.label`, 'Option Label')}
          {renderFieldInput(`options.${index}.value`, 'Option Value')}
          <Button
            variant="destructive"
            type="button"
            onClick={() => remove(index)}
          >
            Remove Option
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ label: '', value: '' })}>
        Add Option
      </Button>
    </React.Fragment>
  );

  // Field rendering helper
  const renderFieldInput = (fieldName: string, label: string) => (
    <FormField
      key={fieldName}
      name={fieldName as keyof z.infer<typeof widgetEditSchema>}
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm text-gray-700">{label}</FormLabel>
          <FormControl>
            <ThemedInput
              {...field}
              placeholder={label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(e);
                handleChange(e);
              }}
              value={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Render logic based on type
  const renderFormFields = () => {
    if (!currentFormField) return null;

    return Object.keys(currentFormField)
      .filter((key) => key !== 'id')
      .map((fieldName) => {
        if (fieldName === 'options') return renderOptionFields();
        return renderFieldInput(
          fieldName,
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        );
      });
  };

  // Reset form when currentFormField changes
  useEffect(() => {
    form.reset(currentFormField);
  }, [currentFormField, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-full space-y-8"
      >
        <h2>
          {t('creation.form.questionLabel') + ' '}
          {currentFormField ? +currentFormField?.id + 1 : 0}
        </h2>
        {renderFormFields()}
      </form>
    </Form>
  );
}
