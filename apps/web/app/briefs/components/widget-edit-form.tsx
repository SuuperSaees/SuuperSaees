'use client';

import React, { ChangeEvent, useEffect  } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Trash,Plus } from 'lucide-react';
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
import UploadImageDropzone from './upload-image-dropzone';
import { useVideoHandler } from '../hooks/use-video-handler';
import { RenderVideoContent } from './render-video-content';

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
    isUploading, videoUrl, isVideoValid, isDragging, fileInputRef, isYouTubeVideo, selectedFileName,
    handleFileChange, handleUrlInput, handleDragEnter, handleDragLeave, handleDrop, setVideoUrl, setIsVideoValid, setSelectedFileName , setIsYouTubeVideo, checkVideoValidity
  } = useVideoHandler(t, form, currentFormField, updateFormField);

  const { fields: optionsFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  // Helper for updating form and context state
  const handleChange = (e: ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
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

  const handleChangeImage = (urlImage:string) => {
    
    form.setValue('label' as keyof z.infer<typeof widgetEditSchema>, urlImage);

    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        id: currentFormField.id,
        'label': urlImage,
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
        <div key={option.id} className="flex flex-col gap-2 relative">
          {renderFieldInput(`options.${index}.label`, 'Option Label',type)}
          {renderFieldInput(`options.${index}.value`, 'Option Value',type)}

          <Button type="button" onClick={() => remove(index)} className='rounded-full w-[1.3rem] h-[1.3rem] p-0 bg-transparent text-gray-600 hover:text-gray-900 hover:bg-transparent shadow-none absolute top-0 right-0 '>
            <Trash className='w-full' />
          </Button>

        </div>
      ))}
      <div className='flex justify-center'>
        <Button type="button" onClick={() => append({ label: '', value: '' })} className='rounded-full w-9 h-9 p-2 bg-transparent text-gray-600 bg-gray-50 hover:bg-gray-100 shadow-none'>
          <Plus className='w-full' />
        </Button>
      </div>
    </React.Fragment>
  );

  const renderFieldInput = (fieldName: string, label: string, type: string) => {
    const fieldIsType = fieldName == 'type'
    const fieldIsPosition = fieldName == 'position'
    const hideSelectPlaceholder = fieldName == 'placeholder' && type == 'select'
    const hideMultiplePlaceholder = fieldName == 'placeholder' && type == 'multiple_choice'
    const hideDropdownPlaceholder = fieldName == 'placeholder' && type == 'dropdown'
    const hideDatePlaceholder = fieldName == 'placeholder' && type == 'date'
    const hideTitlePlaceholderAndDescription = (fieldName == 'placeholder' || fieldName == 'description') && type == 'title'
    
    if(fieldIsType || fieldIsPosition || hideSelectPlaceholder || hideDropdownPlaceholder || hideDatePlaceholder || hideTitlePlaceholderAndDescription || hideMultiplePlaceholder){
      return null
    }else{
      return(
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
      )
    }
    
  };

  const renderImageInput = () => (
    <UploadImageDropzone
      form = {form}
      index = {currentFormField?.id}
      nameField={'label'}
      handleQuestionChange={handleChangeImage}
    />
  );

  const renderFormFields = () => {
    if (!currentFormField) return null;
    const type = form.getValues('type');

    return Object.keys(currentFormField)
      .filter((key) => key !== 'id')
      .map((fieldName) => {
        if (fieldName === 'options') return renderOptionFields(type!);
        if (type === 'image' && fieldName == 'placeholder') return renderImageInput();
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
          type!
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
        className="h-full w-full space-y-8 overflow-y-auto no-scrollbar max-h-full"
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