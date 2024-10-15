'use client';

import React, { useEffect } from 'react';

import { Plus } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { useBriefsContext } from '../contexts/briefs-context';
import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import FieldsetFields from './fieldset-fields';
import FieldsetInformation from './fieldset-information';

type CreateBriefDialogProps = {
  propietaryOrganizationId: string;
  userRole: string;
  showFormFields?: boolean;
  showInfo?: boolean;
};

export type BriefCreationForm = z.infer<typeof briefCreationFormSchema>;

const BriefCreationForm = ({
  userRole,
  showFormFields = true,
  showInfo = false,
}: CreateBriefDialogProps) => {
  const { t } = useTranslation('briefs'); // Translation hook for internationalization

  const { addFormField, formFields, brief, onSubmit, form } =
    useBriefsContext(); // Context to manage form fields

  // Handle adding a new question to the form
  const handleAddQuestion = () => {
    const newQuestion = addFormField('text-short'); // Create a new question field
    // Update the form's questions state with the new question
    form.setValue('questions', [...form.getValues('questions'), newQuestion]);
  };

  // Sync form state with context whenever formFields change
  useEffect(() => {
    form.setValue('questions', formFields); // Ensure form state stays in sync with context
    form.setValue('name', brief.name);
    form.setValue('description', brief.description);
    form.setValue('image_url', brief.image_url);
  }, [formFields, form, brief, brief.description, brief.name, brief.image_url]); // Re-run effect when formFields or form change

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="no-scrollbar flex h-full w-full flex-col space-y-8 overflow-y-auto"
      >
        {/* Brief Name Input */}
        {showInfo && <FieldsetInformation form={form} />}

        {/* Default and not editable input field */}
        {showFormFields && (
            <FormField
              control={form.control}
              name='default_question.description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-700">
                    {form.getValues().default_question.label}
                  </FormLabel>
                  <FormControl>
                    <ThemedInput
                      {...field}
                      placeholder={t('creation.form.defaultPlaceholder')}
                      className="focus-visible:ring-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        {showFormFields && (
          <>
            <FieldsetFields form={form} userRole={userRole} />
            <ThemedButton type="button" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4" />
              {t('creation.form.addQuestion')}
            </ThemedButton>
          </>
        )}
      </form>
    </Form>
  );
};

export default BriefCreationForm;
