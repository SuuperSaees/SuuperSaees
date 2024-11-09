'use client';

import React, { useEffect } from 'react';

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

import AddElementButton from '~/components/add-element-button';
import { Brief } from '~/lib/brief.types';

import { useBriefsContext } from '../contexts/briefs-context';
import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import BriefServicesAssignation from './brief-services-assignation';
import FieldsetFields from './fieldset-fields';
import FieldsetInformation from './fieldset-information';

type CreateBriefDialogProps = {
  propietaryOrganizationId: string;
  userRole: string;
  showFormFields?: boolean;
  showInfo?: boolean;
  defaultValues?: Brief.Relationships.FormField[];
  defaultBriefInfo?: Brief.Insert;
};

export type BriefCreationForm = z.infer<typeof briefCreationFormSchema>;

const BriefCreationForm = ({
  userRole,
  showFormFields = true,
  showInfo = false,
  defaultValues = [],
  defaultBriefInfo = {
    name: '',
    description: '',
    image_url: '',
    propietary_organization_id: '',
    services: [],
  },
}: CreateBriefDialogProps) => {
  const { t } = useTranslation('briefs'); // Translation hook for internationalization
  const isUpdate = defaultValues.length > 0; // Check if the form is for updating an existing brief
  const {
    addFormField,
    formFields,
    brief,
    onSubmit,
    form,
    setFormFields,
    setBrief,
  } = useBriefsContext(); // Context to manage form fields

  // Handle adding a new question to the form
  const handleAddQuestion = () => {
    const newQuestion = addFormField('text-short'); // Create a new question field
    // Update the form's questions state with the new question
    form.setValue('questions', [...form.getValues('questions'), newQuestion]);
  };

  useEffect(() => {
    if (defaultValues.length) {
      form.setValue('questions', defaultValues);
      setFormFields(defaultValues);
      form.setValue('name', defaultBriefInfo.name);
      form.setValue('description', defaultBriefInfo.description);
      form.setValue('image_url', defaultBriefInfo.image_url);
      form.setValue(
        'connected_services',
        defaultBriefInfo?.services.map((service) => service.id),
      );
      setBrief(defaultBriefInfo);
    }
  }, [defaultValues]);

  // Sync form state with context whenever formFields change
  useEffect(() => {
    form.setValue('questions', formFields); // Ensure form state stays in sync with context
    form.setValue('name', brief.name);
    form.setValue('description', brief.description);
    form.setValue('image_url', brief.image_url);
    form.setValue(
      'connected_services',
      brief.services?.map((service) => service.id),
    );
  }, [
    formFields,
    form,
    brief,
    brief.description,
    brief.name,
    brief.image_url,
    brief?.services,
    defaultValues,
    setFormFields,
  ]); // Re-run effect when formFields or form change

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, isUpdate ?? false),
        )}
        className="no-scrollbar flex h-full w-full flex-col space-y-8 overflow-y-auto"
      >
        {/* Brief Name Input */}
        {showInfo && (
          <>
            <FieldsetInformation form={form} />
            <BriefServicesAssignation form={form} />
          </>
        )}

        {/* Default and not editable input field */}
        {showFormFields && (
          <FormField
            control={form.control}
            name="default_question.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-gray-600">
                  {form.getValues().default_question.label}
                </FormLabel>
                <FormControl>
                  <ThemedInput
                    {...field}
                    placeholder={t('creation.form.defaultPlaceholder')}
                    className="focus-visible:ring-none border-transparent font-medium text-gray-500 shadow-none focus:border-input placeholder:text-gray-400 placeholder:font-normal
                    focus:px-4 p-0 "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showFormFields && (
          <>
            <FieldsetFields form={form} userRole={userRole} />
            <AddElementButton
              message={t('creation.form.addQuestion')}
              buttonAction={() => handleAddQuestion()}
            />
          </>
        )}
      </form>
    </Form>
  );
};

export default BriefCreationForm;
