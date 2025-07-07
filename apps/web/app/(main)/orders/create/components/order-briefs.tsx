import React from 'react';

import { InfoIcon } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';

import { DatePicker } from '~/components/date-seletc';
import { SingleChoiceDropdown } from '~/components/dropdown';
import { MultipleChoice } from '~/components/multiple-choice';
import RadioOptions from '~/components/single-choice';
import { FileUploadState } from '~/hooks/use-file-upload';
import { Brief } from '~/lib/brief.types';
import { File } from '~/lib/file.types';
import { FormField as FormFieldType } from '~/lib/form-field.types';
import { containsVideo } from '~/utils/contains-video';
import { isYouTubeUrl } from '~/utils/upload-video';

import FilesUploader from '../../../../components/file-preview/files-uploader';
import { getYouTubeEmbedUrl } from '../utils/video-format';
import VideoDescriptionRenderer from './video-description-renderer';

type Option = {
  value: string;
  label: string;
};

export const OrderBriefs = ({
  brief,
  form,
  orderId,
}: {
  brief: Brief.Relationships.Services.Response | null;
  form: UseFormReturn<
    {
      briefSelection: {
        selectedBriefId: string;
      };
      briefCompletion: {
        brief_responses?: Record<string, string | undefined>;
        uuid: string;
        files: File.Insert[];
        description?: string | undefined;
        title?: string | undefined;
        order_followers?: string[] | undefined;
      };
    },
    unknown,
    undefined
  >;
  orderId: string;
}) => {
  const notValidFormTypes = new Set([
    'h1',
    'h2',
    'h3',
    'h4',
    'rich-text',
    'image',
    'video',
  ]);

  const handleFilesChange = (uploads: FileUploadState[]) => {
    const responseValue =
      uploads.map((upload) => upload.url)
        .join(',') ?? '';
    return {
      responseValue,
      files: uploads.map((upload) => ({
        id: upload.id ?? undefined,
        name: upload.file.name ?? '',
        size: upload.file.size ?? 0,
        type: upload.file.type ?? '',
        url: upload.url ?? '',
        user_id: '',
      })),
    };
  };

  const setFormResponse = (
    currentFieldIndex: number,
    formField: FormFieldType.Type,
    responseValue: string,
    uploadedFiles: File.Insert[],
  ) => {
    form.setValue('briefCompletion.files', uploadedFiles);
  };

  const renderSpecialFormField = (formField: FormFieldType.Type) => {
    switch (formField.type) {
      case 'h1':
        return <h1 className="text-3xl font-bold">{formField.label}</h1>;
      case 'h2':
        return <h2 className="text-2xl font-bold">{formField.label}</h2>;
      case 'h3':
        return <h3 className="text-xl font-bold">{formField.label}</h3>;
      case 'h4':
        return <h4 className="text-lg font-bold">{formField.label}</h4>;
      case 'rich-text':
        return <div dangerouslySetInnerHTML={{ __html: formField.label }} />;
      case 'image':
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={formField.label}
            alt={formField.label}
            className="h-auto max-w-full"
          />
        );
      case 'video': {
        const videoUrl = formField.label;
        if (isYouTubeUrl(videoUrl)) {
          const embedUrl = getYouTubeEmbedUrl(videoUrl);
          return (
            <iframe
              width="full"
              height={400}
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={formField.label}
            ></iframe>
          );
        } else {
          return (
            <video controls className="max-w-full">
              <source src={formField.label} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          );
        }
      }
      default:
        return null;
    }
  };

  const briefSetValuePrefix = 'briefCompletion';
  const briefResponseSufix = 'brief_responses';

  return (
    <div className="flex flex-col gap-8">
      {(() => {
        let uniqueIndexCounter = 0; // Initialize a counter outside the map functions

        return (
          <div key={brief?.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-8">
              {brief?.form_fields
                ?.sort(
                  (a, b) =>
                    (a?.field?.position ?? 0) - (b?.field?.position ?? 0),
                )
                .map((formField) => {
                  const currentFieldIndex = notValidFormTypes.has(
                    formField.field?.type ?? '',
                  )
                    ? uniqueIndexCounter
                    : uniqueIndexCounter++; // Increment the counter for each form field

                  if (notValidFormTypes.has(formField.field?.type ?? '')) {
                    return renderSpecialFormField(
                      formField.field as FormFieldType.Type,
                    );
                  }
                  return (
                    <FormField
                      key={formField.field?.id}
                      control={form.control}
                      name={`${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{formField.field?.label}</FormLabel>

                          {formField.field?.description &&
                            (containsVideo(formField.field?.description) ? (
                              <VideoDescriptionRenderer
                                description={formField.field?.description}
                              />
                            ) : (
                              <FormDescription>
                                {formField.field?.description}
                              </FormDescription>
                            ))}

                          <FormControl>
                            {formField.field?.type === 'select' ? (
                              <RadioOptions
                                options={
                                  (formField.field?.options as Option[]) ?? []
                                }
                                useGridLayout={((formField.field?.options as Option[]) ?? []).length > 3}
                                onChange={(
                                  event: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                  const value = event.target.value as never;
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    value,
                                  );
                                }}
                                selectedOption={
                                  form.getValues(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                  ) ?? ''
                                }
                              />
                            ) : formField.field?.type === 'multiple_choice' ? (
                              <MultipleChoice
                                items={
                                  (formField.field?.options as Option[]) ?? []
                                }
                                useGridLayout={((formField.field?.options as Option[]) ?? []).length > 3}
                                selectedOptions={(
                                  form.getValues(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                  ) ?? ''
                                )
                                  .split(',')
                                  .map((o) => o.trim())
                                  .filter(Boolean)}
                                onChange={(value) => {
                                  const joinedValue = Array.isArray(value)
                                    ? value.join(', ')
                                    : value;
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    joinedValue as never,
                                  );
                                }}
                              />
                            ) : formField.field?.type === 'text-short' ? (
                              <ThemedInput
                                placeholder={
                                  formField.field?.placeholder ?? undefined
                                }
                                {...field}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                  const responseValue = e.target.value;
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    responseValue as never,
                                  );
                                }}
                              />
                            ) : formField.field?.type === 'text-large' ? (
                              <Textarea
                                placeholder={
                                  formField.field?.placeholder ?? undefined
                                }
                                {...field}
                                onChange={(
                                  e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) => {
                                  const responseValue = e.target.value;
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    responseValue as never,
                                  );
                                }}
                                style={{ whiteSpace: 'pre-wrap' }}
                                rows={5}
                              >
                                {field.value}
                              </Textarea>
                            ) : formField.field?.type === 'file' ? (
                              <FilesUploader
                                bucketName="orders"
                                path={`uploads/${orderId}`}
                                onFilesSelected={(fileUploads) => {
                                  const { responseValue, files: newFiles } =
                                    handleFilesChange(fileUploads);
                                  setFormResponse(
                                    currentFieldIndex,
                                    formField.field as FormFieldType.Type,
                                    responseValue as never,
                                    newFiles,
                                  );
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    responseValue as never,
                                  );
                                }}
                                onRemoveFile={(id) => {
                                  const currentFiles = form.getValues('briefCompletion.files') || [];
                     
                                  // Filter by URL only since stored files don't have id
                                  const updatedFiles = currentFiles.filter((file) => file.id !== id);
                                  form.setValue('briefCompletion.files', updatedFiles);
                                  // Update the response value to reflect the removed file
                                  const responseValue = updatedFiles.map((file) => file.url).join(',');
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    responseValue as never,
                                  );
                                }}
                              />
                            ) : formField.field?.type === 'date' ? (
                              <DatePicker
                                onDateChange={(selectedDate: Date) => {
                                  const responseValue = selectedDate;
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    responseValue as never,
                                  );
                                }}
                              />
                            ) : formField.field?.type === 'dropdown' ? (
                              <SingleChoiceDropdown
                                items={
                                  (formField.field?.options as Option[]) ?? []
                                }
                                question={formField.field?.label ?? ''}
                                selectedOption={
                                  form.getValues(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                  ) ?? ''
                                }
                                onChange={(value) => {
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${formField.field?.id}`,
                                    value as never,
                                  );
                                }}
                              />
                            ) : null}
                          </FormControl>

                          <FormMessage />
                          {formField.field?.alert_message && (
                            <div className="flex items-center gap-3 rounded-md bg-accent p-3 px-5 text-sm text-foreground">
                              <InfoIcon size="16" strokeWidth={2} />
                              {formField.field?.alert_message}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  );
                })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
