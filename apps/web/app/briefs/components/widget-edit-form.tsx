'use client';

import React, { ChangeEvent, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from 'lucide-react';
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
import { useVideoHandler } from '../hooks/use-video-handler';
import { widgetEditSchema } from '../schemas/widget-edit-schema';
import { RenderVideoContent } from './render-video-content';
import UploadImageDropzone from './upload-image-dropzone';

export type WidgetCreationForm = z.infer<typeof widgetEditSchema>;
export function WidgetEditForm() {
  const { currentFormField, updateFormField } = useBriefsContext();
  const { t } = useTranslation('briefs');
  const form = useForm<z.infer<typeof widgetEditSchema>>({
    resolver: zodResolver(widgetEditSchema),
    defaultValues: currentFormField,
    mode: 'onChange',
  });

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

  const {
    fields: optionsFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  // Helper for updating form and context state
  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
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

  const handleChangeImage = (urlImage: string) => {
    form.setValue('label' as keyof z.infer<typeof widgetEditSchema>, urlImage);

    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        id: currentFormField.id,
        label: urlImage,
      });
    }
  };

  const onSubmit = (values: z.infer<typeof widgetEditSchema>) => {
    if (currentFormField) {
      updateFormField(currentFormField.id, { ...currentFormField, ...values });
    }
  };

  const renderOptionFields = (type: string) => (
    <React.Fragment>
      {optionsFields.map((option, index) => (
        <div key={option.id} className="relative flex flex-col gap-2">
          {renderFieldInput(
            `options.${index}.label`,
            'Option Label',
            type,
            index,
            false,
          )}

          {renderFieldInput(
            `options.${index}.value`,
            'Option Value',
            type,
            index,
            true,
          )}

          <Button
            type="button"
            onClick={() => remove(index)}
            className="absolute right-0 top-0 h-[1.3rem] w-[1.3rem] rounded-full bg-transparent p-0 text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900"
          >
            <Trash className="w-full" />
          </Button>
        </div>
      ))}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={() => append({ label: '', value: '' })}
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
    const hideSelectPlaceholder =
      fieldName == 'placeholder' && type == 'select';
    const hideMultiplePlaceholder =
      fieldName == 'placeholder' && type == 'multiple_choice';
    const hideDropdownPlaceholder =
      fieldName == 'placeholder' && type == 'dropdown';
    const hideDatePlaceholder = fieldName == 'placeholder' && type == 'date';
    const hideTitlePlaceholderAndDescription =
      (fieldName == 'placeholder' || fieldName == 'description') &&
      type == 'h1';
    

    if (
      fieldIsType ||
      fieldIsPosition ||
      hideSelectPlaceholder ||
      hideDropdownPlaceholder ||
      hideDatePlaceholder ||
      hideTitlePlaceholderAndDescription ||
      hideMultiplePlaceholder
    ) {
      return null;
    } else {
      return (
        <FormField
          key={fieldName}
          name={fieldName as keyof z.infer<typeof widgetEditSchema>}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={isValueField ? 'hidden' : 'text-sm text-gray-700'}
              >
                {label}
              </FormLabel>
              <FormControl>
                <ThemedInput
                  {...field}
                  className={isValueField ? 'hidden' : ''}
                  placeholder={label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // For label, we update both the label and the value fields
                    if (!isValueField && index !== undefined) {
                      const sanitizedValue = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '_') // Replace spaces with underscores
                        .replace(/[^\w_]+/g, ''); // Remove special characters

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
        index={currentFormField?.id}
        nameField={'label'}
        handleQuestionChange={handleChangeImage}
        defaultValue={currentFormField?.label}
        handleRemove={currentFormField ? () => updateFormField(currentFormField?.id, { ...currentFormField, label: '' }) : () => null}
      />
    );
  };

  const renderFormFields = () => {
    if (!currentFormField) return null;
    const type = form.getValues('type');

    return Object.keys(currentFormField)
      .filter((key) => key !== 'id')
      .map((fieldName) => {
        if (fieldName === 'options') return renderOptionFields(type!);
        if (type === 'image' && fieldName == 'placeholder')
          return renderImageInput();
        if (type === 'image' && fieldName == 'label') return null;
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
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
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
