'use client';

import React, { useEffect, useRef } from 'react';

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
import { FormField as FormFieldType } from '~/lib/form-field.types';

import { useBriefsContext } from '../contexts/briefs-context';
import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import { Brief } from '../types/brief.types';
import BriefServicesAssignation from './brief-services-assignation';
import FieldsetFields from './fieldset-fields';
import FieldsetInformation from './fieldset-information';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

type FormFieldType = FormFieldType.Response;

type CreateBriefDialogProps = {
  showFormFields?: boolean;
  showInfo?: boolean;
  defaultFormFields?: FormFieldType[];
  defaultBriefInfo?: Brief;
};

export type BriefCreationForm = z.infer<typeof briefCreationFormSchema>;

const BriefCreationForm = ({
  showFormFields = true,
  showInfo = false,
  defaultFormFields = [],
  defaultBriefInfo = {
    name: '',
    description: '',
    image_url: '',
    services: [],
  },
}: CreateBriefDialogProps) => {
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace.role ?? '';
  const { t } = useTranslation('briefs'); // Translation hook for internationalization
  const isUpdate = defaultFormFields.length > 0; // Check if the form is for updating an existing brief
  const renderNumber = useRef(1);
  const {
    formFields,
    brief,
    form,
    setFormFields,
    setBrief,
    onSubmit,
    createDefaultFormFields,
    setActiveTab,
    stopEditing,
  } = useBriefsContext(); // Context to manage form fields

  // Handle adding a new question to the form
  const handleAddQuestion = () => {
    setActiveTab('widgets');
    stopEditing();
  };

  useEffect(() => {
    if (defaultBriefInfo.name && renderNumber.current === 1) {
      const { 
        defaultFormFields: formattedDefaultFormFields,
        defaultInitialFormField,
      } = createDefaultFormFields(defaultFormFields);
      createDefaultFormFields(defaultFormFields);

      if (defaultInitialFormField) {
        form.setValue('default_question', defaultInitialFormField);
      }
      // console.log('defaultQuestion', defaultInitialFormField);
      // console.log('formattedDefaultFormFields', formattedDefaultFormFields);
      // form.setValue('questions', formattedDefaultFormFields);
      setFormFields(formattedDefaultFormFields);
      // form.setValue('name', defaultBriefInfo.name);
      // form.setValue('description', defaultBriefInfo.description);
      // form.setValue('image_url', defaultBriefInfo.image_url);
      // form.setValue(
      //   'connected_services',
      //   defaultBriefInfo?.services.map((service) => service.id),
      // );
      setBrief(defaultBriefInfo);
      renderNumber.current = renderNumber.current + 1;
    }
  }, [
    createDefaultFormFields,
    defaultBriefInfo,
    defaultFormFields,
    form,
    setBrief,
    setFormFields,
    formFields.length,
  ]);
  
  // Sync form state with context whenever formFields change
  useEffect(() => {
    // console.log('form', form.getValues(), 'errors', form.formState.errors);
    // console.log('formFields', formFields);
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
    setFormFields,
  ]);
  // Re-run effect when formFields or form change
  // console.log('formfields', formFields, );
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, isUpdate ?? false),
        )}
        className="no-scrollbar flex h-full w-full flex-col space-y-2 overflow-y-auto"
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
          <div className='px-6 py-6'>
            <FormField
              control={form.control}
              name="default_question.description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className='text-gray-600 font-bold'>{form.getValues().default_question.label}</FormLabel>
                  <FormControl>
                    <ThemedInput
                      {...field}
                      placeholder={t('creation.form.defaultPlaceholder')}
                      className="focus-visible:ring-none bg-white text-gray-400"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
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
