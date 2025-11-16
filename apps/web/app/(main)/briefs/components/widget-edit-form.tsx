'use client';

import React, { ChangeEvent, useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedTextarea } from 'node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings';
import { useForm } from 'react-hook-form';
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
import { Switch } from '@kit/ui/switch';

import { FormField as FormFieldType } from '~/lib/form-field.types';
import { deepEqual } from '~/utils/compare';

import { useBriefsContext } from '../contexts/briefs-context';
import { useVideoHandler } from '../hooks/use-video-handler';
import { widgetEditSchema } from '../schemas/widget-edit-schema';
import { FormField as FormFieldBrief, Option } from '../types/brief.types';
import FormRichTextComponent from './content-fields/rich-text-content';
import { RenderVideoContent } from './render-video-content';
import UploadImageDropzone from './upload-image-dropzone';

// Constants for the "other" option
const OTHER_OPTION_PREFIX = 'suuper-custom';

// Helper functions for managing the "other" option
const isOtherOption = (option: Option): boolean => {
  return option.label.startsWith(OTHER_OPTION_PREFIX);
};

const createOtherOption = (t: (key: string) => string): Option => {
  return {
    label: `${OTHER_OPTION_PREFIX}-${t('creation.form.marks.other_option_label')}`,
    value: '',
  };
};

const hasOtherOption = (options: Option[]): boolean => {
  return options.some(isOtherOption);
};

function organizeFormField(field: FormFieldType.Type) {
  // Create a new object with keys in the desired order
  return {
    label: field.label,
    description: field.description,
    placeholder: field.placeholder,
    options: field.options,
    type: field.type,
    position: field.position,
    alert_message: field.alert_message,
    required: field.required,
    id: field.id,
  };
}

export type WidgetCreationForm = z.infer<typeof widgetEditSchema>;
export function WidgetEditForm() {
  const {
    currentFormField,
    updateFormField,
    updateBriefFormFields,
    formFields,
  } = useBriefsContext();
  const { t } = useTranslation('briefs');
  const form = useForm<z.infer<typeof widgetEditSchema>>({
    resolver: zodResolver(widgetEditSchema),
    defaultValues: currentFormField,
    mode: 'onChange',
  });
  const initialFormState =
    useRef<Partial<FormFieldBrief | undefined>>(currentFormField);
  const {
    isUploading,
    videoUrl,
    isVideoValid,
    isDragging,
    fileInputRef,
    isYouTubeVideo,
    selectedFileName,
    handleFileChange,
    handleUrlInput,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    setVideoUrl,
    setIsVideoValid,
    setSelectedFileName,
    setIsYouTubeVideo,
    checkVideoValidity,
  } = useVideoHandler(t, form, currentFormField, updateFormField);

  // Remove function for options // should also updateFormField
  const removeOption = (index: number) => {
    // remove(index);
    const optionsFields = form.getValues('options');
    const newOPtions = optionsFields?.filter((option, i) => i !== index);
    form.setValue('options', newOPtions);
    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...currentFormField,
        options: newOPtions,
      });
    }
  };
  const addOption = () => {
    const optionsFields = form.getValues('options');
    const newOption = {
      label: '',
      value: '',
    };
    form.setValue('options', [...(optionsFields ?? []), newOption]);
    const updatedOptions = optionsFields
      ? [...optionsFields, newOption]
      : [newOption];
    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...currentFormField,
        options: updatedOptions,
      });
    }
  };

  // Handle "Add other" switch change
  const handleAllowOtherChange = (checked: boolean) => {
    const currentOptions = form.getValues('options') ?? [];
    
    if (checked) {
      // Add "other" option if not already present
      if (!hasOtherOption(currentOptions)) {
        const otherOption = createOtherOption(t);
        const updatedOptions = [...currentOptions, otherOption];
        form.setValue('options', updatedOptions);
        
        if (currentFormField) {
          updateFormField(currentFormField.id, {
            ...currentFormField,
            options: updatedOptions,
          });
        }
      }
    } else {
      // Remove "other" option
      const filteredOptions = currentOptions.filter(option => !isOtherOption(option));
      form.setValue('options', filteredOptions);
      
      if (currentFormField) {
        updateFormField(currentFormField.id, {
          ...currentFormField,
          options: filteredOptions,
        });
      }
    }
  };

  // Helper for updating form and context state
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    form.setValue(name as keyof z.infer<typeof widgetEditSchema>, value);

    const isOption = name.startsWith('options');
    if (currentFormField && !isOption) {
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        [name]: value,
      });
    } else if (isOption && currentFormField) {
      const optionIndex = parseInt(name.split('.')[1] ?? "0", 10); // Default to 0 if split fails
      const newOptions = [...(currentFormField?.options ?? [])];
      newOptions[optionIndex] = {
        ...(currentFormField?.options?.[optionIndex] as Option),
        label: value,
        value: value,
      };
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        ['options']: newOptions,
      });
    }
  };

  const handleBlur = async () => {
    const currentFormState = form.getValues();
    const updatedFields = formFields?.map((field) =>
      field.id === currentFormField?.id
        ? { ...field, ...currentFormField }
        : field,
    );
    // Use the custom deep equality check
    if (!deepEqual(initialFormState.current, currentFormState)) {
      await updateBriefFormFields(updatedFields);
      initialFormState.current = currentFormField;
    }
  };

  const handleSwitchChange = (name: 'required', checked: boolean) => {
    form.setValue(name, checked);
    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        [name]: checked,
      });
    }
  };

  const handleChangeContent = (value: string) => {
    form.setValue('label' as keyof z.infer<typeof widgetEditSchema>, value);
    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        label: value,
      });
    }
  };

  const onSubmit = (values: z.infer<typeof widgetEditSchema>) => {
    if (currentFormField) {
      updateFormField(currentFormField.id, { ...currentFormField, ...values });
    }
  };

  const renderOptionFields = (type: string, options: Option[]) => (
    <React.Fragment>
      {options?.map((option, index) => {
        // Don't render the "other" option in the regular option list
        if (isOtherOption(option)) {
          return null;
        }
        
        return (
        <div
          key={'opt-' + index}
          className="group relative flex flex-col gap-2"
        >
          {renderFieldInput(
            `options.${index}.label`,
            t('creation.form.marks.options.label', { number: index + 1 }),
            type,
            index,
            false,
          )}

          {renderFieldInput(
            `options.${index}.value`,
            t('creation.form.marks.options.value', { number: index + 1 }),
            type,
            index,
            true,
          )}

          <Button
            type="button"
            onClick={() => removeOption(index)}
            className="text-red absolute right-1 top-0 hidden h-4 w-4 rounded-full bg-transparent p-0 text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900 group-hover:block"
          >
            <Trash className="w-full" />
          </Button>
        </div>
        );
      })}
      
      {/* Add Other Option Switch */}
      <div className="flex items-center justify-between space-y-0 py-2">
        <p className="text-sm font-bold text-gray-600">
          {t('creation.form.marks.allow_other')}
        </p>
        <Switch
          checked={hasOtherOption(form.getValues('options') ?? [])}
          onCheckedChange={handleAllowOtherChange}
        />
      </div>
      
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={() => addOption()}
          className="h-9 w-9 rounded-full bg-gray-50 bg-transparent p-2 text-gray-600 shadow-none hover:bg-gray-100"
        >
          <Plus className="w-full" />
        </Button>
      </div>
    </React.Fragment>
  );

  const renderFieldInput = (
    fieldName: string,
    label: string,
    type: string,
    index?: number,
    isValueField = false,
  ) => {
    const fieldIsType = fieldName == 'type';
    const fieldIsPosition = fieldName == 'position';
    const hideSelectFields = fieldName == 'placeholder' && type == 'select';
    const hideMultipleChoiceFields =
      fieldName == 'placeholder' && type == 'multiple_choice';
    const hideDropdownFields = fieldName == 'placeholder' && type == 'dropdown';
    const hideDateFields = fieldName == 'placeholder' && type == 'date';
    const hideTitleFields =
      (fieldName == 'placeholder' || fieldName == 'description') &&
      type == 'h1';
    const hideRichTextFields =
      (fieldName == 'placeholder' ||
        fieldName == 'description' ||
        fieldName == 'questions') &&
      type == 'rich-text';
    const hideAletFields = fieldName === 'alert_message';
    const hideFilePlaceholder = fieldName === 'placeholder' && type === 'file';
    const hideOptions =
      fieldName === 'options' &&
      type !== 'multiple_choice' &&
      type !== 'select';

    if (
      fieldIsType ||
      fieldIsPosition ||
      hideSelectFields ||
      hideDropdownFields ||
      hideDateFields ||
      hideTitleFields ||
      hideMultipleChoiceFields ||
      hideRichTextFields ||
      hideAletFields ||
      hideFilePlaceholder ||
      hideOptions
    ) {
      return null;
    } else if (fieldName == 'required') {
      return (
        <FormField
          key={fieldName}
          name={fieldName as keyof z.infer<typeof widgetEditSchema>}
          control={form.control}
          render={({ field }) => (
            <FormItem
              className="flex items-center justify-between space-y-0"
              onBlur={handleBlur}
            >
              <p className="text-sm font-bold text-gray-600">
                {t('validation.required')}
              </p>
              <FormControl>
                <Switch
                  checked={field.value ? true : false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    handleSwitchChange('required', checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      );
    } else if (fieldName === 'description') {
      return (
        <FormField
          key={fieldName}
          name={fieldName as keyof z.infer<typeof widgetEditSchema>}
          control={form.control}
          render={({ field }) => (
            <FormItem onBlur={handleBlur}>
              <FormLabel
                className={
                  isValueField ? 'hidden' : 'text-sm font-bold text-gray-600'
                }
              >
                {label}
              </FormLabel>
              <FormControl>
                <ThemedTextarea
                  {...field}
                  className={
                    isValueField
                      ? 'hidden'
                      : 'focus-visible:ring-none text-gray-500 focus-visible:ring-0'
                  }
                  placeholder={label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // For label, we update both the label and the value fields
                    if (!isValueField && index !== undefined) {
                      const sanitizedValue = e.target.value;
                      // .toLowerCase()
                      // .replace(/\s+/g, '_') // Replace spaces with underscores
                      // .replace(/[^\w_]+/g, ''); // Remove special characters

                      form.setValue(`options.${index}.value`, sanitizedValue);
                    }

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
    } else {
      return (
        <FormField
          key={fieldName}
          name={fieldName as keyof z.infer<typeof widgetEditSchema>}
          control={form.control}
          render={({ field }) => (
            <FormItem onBlur={handleBlur}>
              <FormLabel
                className={
                  isValueField ? 'hidden' : 'text-sm font-bold text-gray-600'
                }
              >
                {label}
              </FormLabel>
              <FormControl>
                <ThemedInput
                  {...field}
                  className={isValueField ? 'hidden' : 'text-gray-500'}
                  placeholder={label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // For label, we update both the label and the value fields
                    if (!isValueField && index !== undefined) {
                      const sanitizedValue = e.target.value;
                      // .toLowerCase()
                      // .replace(/\s+/g, '_') // Replace spaces with underscores
                      // .replace(/[^\w_]+/g, ''); // Remove special characters
                      form.setValue(`options.${index}.value`, sanitizedValue);
                    }

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
    }
  };

  const renderImageInput = () => {
    return (
      <UploadImageDropzone
        form={form}
        index={currentFormField?.position}
        nameField={'label'}
        handleQuestionChange={handleChangeContent}
        defaultValue={currentFormField?.label}
        handleRemove={
          currentFormField
            ? () =>
                updateFormField(currentFormField?.id, {
                  ...currentFormField,
                  label: '',
                })
            : () => null
        }
      />
    );
  };

  const renderRichTextInput = () => {
    if (!currentFormField) return null;
    return (
      <FormRichTextComponent
        index={currentFormField?.position}
        form={form}
        userRole={''}
        inSidebar={true}
        handleQuestionChange={handleChangeContent}
        question={currentFormField}
      />
    );
  };
  const renderFormFields = () => {
    if (!currentFormField) return null;
    const type = form.getValues('type');

    return Object.keys(organizeFormField(currentFormField))
      .filter((key) => key !== 'id')
      .map((fieldName) => {
        if (
          fieldName === 'options' &&
          (type === 'multiple_choice' ||
            type === 'select' ||
            type === 'dropdown')
        )
          return renderOptionFields(type, currentFormField.options as Option[]);
        if (type === 'image' && fieldName == 'placeholder')
          return renderImageInput();
        if (type === 'image' && fieldName == 'label') return null;
        if (type === 'rich-text' && fieldName == 'label')
          return renderRichTextInput();
        if (type === 'video' && fieldName === 'label') {
          return (
            <div key={fieldName}>
              <RenderVideoContent
                isUploading={isUploading}
                videoUrl={videoUrl}
                isVideoValid={isVideoValid}
                isDragging={isDragging}
                fileInputRef={fileInputRef}
                isYouTubeVideo={isYouTubeVideo}
                selectedFileName={selectedFileName}
                t={t}
                handleFileChange={handleFileChange}
                handleUrlInput={handleUrlInput}
                handleDragEnter={handleDragEnter}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                setVideoUrl={setVideoUrl}
                setIsVideoValid={setIsVideoValid}
                setIsYouTubeVideo={setIsYouTubeVideo}
                setSelectedFileName={setSelectedFileName}
              />
            </div>
          );
        }
        return renderFieldInput(
          fieldName,
          t('creation.form.marks.' + fieldName),
          type!,
        );
      });
  };

  useEffect(() => {
    form.reset(currentFormField);
    if (currentFormField?.type === 'video' && currentFormField?.label) {
      const validateInitialVideo = async () => {
        const isValid: boolean = (await checkVideoValidity(
          currentFormField.label,
        )) as boolean;
        setIsVideoValid(isValid);
        setVideoUrl(isValid ? currentFormField.label : null);
      };
      validateInitialVideo().catch((error) => {
        console.error('Error validating initial video:', error);
      });
    }
  }, [currentFormField, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="no-scrollbar h-full max-h-full w-full space-y-8 overflow-y-auto"
      >
        {renderFormFields()}
      </form>
    </Form>
  );
}
