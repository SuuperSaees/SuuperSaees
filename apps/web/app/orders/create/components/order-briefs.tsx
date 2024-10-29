import React, { useState } from 'react';

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
import UploadFileComponent from '~/components/ui/files-input';
import { Brief } from '~/lib/brief.types';
import { containsVideo } from '~/utils/contains-video';
import { generateUUID } from '~/utils/generate-uuid';
import { isYouTubeUrl } from '~/utils/upload-video';

import { getYouTubeEmbedUrl } from '../utils/video-format';
import VideoDescriptionRenderer from './video-description-renderer';

type Option = {
  value: string;
  label: string;
};

export const OrderBriefs = ({
  briefs,
  form,
  orderId,
}: {
  briefs: Brief.Response[];
  form: UseFormReturn<
    {
      briefSelection: {
        selectedBriefId: string;
      };
      briefCompletion: {
        uuid: string;
        fileIds: string[];
        description?: string | undefined;
        title?: string | undefined;
        brief_responses?:
          | {
              form_field_id: string;
              brief_id: string;
              order_id: string;
              response: string;
            }[]
          | undefined;
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

  const [_uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const uniqueId = generateUUID();

  const handleFileIdsChange = (fileIds: string[]) => {
    setUploadedFileIds(fileIds);
    const responseValue = fileIds.join(', ');
    return responseValue;
  };

  const setFormResponse = (
    currentFieldIndex: number,
    formField: any,
    briefId: string,
    responseValue: string,
  ) => {
    form.setValue(`briefCompletion.brief_responses.${currentFieldIndex}`, {
      form_field_id: formField.field?.id ?? '',
      brief_id: briefId,
      order_id: orderId,
      response: responseValue,
    });
  };

  const renderSpecialFormField = (formField: any) => {
    switch (formField.field?.type) {
      case 'h1':
        return <h1 className="text-3xl font-bold">{formField.field?.label}</h1>;
      case 'h2':
        return <h2 className="text-2xl font-bold">{formField.field?.label}</h2>;
      case 'h3':
        return <h3 className="text-xl font-bold">{formField.field?.label}</h3>;
      case 'h4':
        return <h4 className="text-lg font-bold">{formField.field?.label}</h4>;
      case 'rich-text':
        return (
          <div dangerouslySetInnerHTML={{ __html: formField.field?.label }} />
        );
      case 'image':
        return (
          <img
            src={formField.field?.label}
            alt={formField.field?.label}
            className="h-auto max-w-full"
          />
        );
      case 'video': {
        const videoUrl = formField.field?.label;
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
              title={formField.field?.label}
            ></iframe>
          );
        } else {
          return (
            <video controls className="max-w-full">
              <source src={formField.field?.label} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          );
        }
      }
      default:
        return null;
    }
  };

  
  const briefSetValuePrefix = 'briefCompletion'
  const briefResponseSufix = 'brief_responses';

  return (
    <div className="flex flex-col gap-8">
      {(() => {
        let uniqueIndexCounter = 0; // Initialize a counter outside the map functions

        return briefs?.map((brief) => (
          <div key={brief?.id} className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">{brief?.name}</h3>
            <div className="flex flex-col gap-8">
              {brief?.form_fields
                ?.sort(
                  (a, b) => (a.field.position ?? 0) - (b.field.position ?? 0),
                )
                .map((formField) => {
                  const currentFieldIndex = notValidFormTypes.has(
                    formField.field?.type ?? '',
                  )
                    ? uniqueIndexCounter
                    : uniqueIndexCounter++; // Increment the counter for each form field

                  if (notValidFormTypes.has(formField.field?.type ?? '')) {
                    return renderSpecialFormField(formField);
                  }
                  return (
                    <FormField
                      key={formField.field?.id}
                      control={form.control}
                      name={`${briefResponseSufix}.${currentFieldIndex}.response`}
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
                                onChange={(
                                  event: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                  const value = event.target.value;
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}`,
                                    {
                                      form_field_id: formField.field?.id ?? '',
                                      brief_id: brief.id,
                                      order_id: orderId,
                                      response: value,
                                    },
                                  );
                                }}
                                selectedOption={
                                  form.getValues(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}.response`,
                                  ) || ''
                                }
                              />
                            ) : formField.field?.type === 'multiple_choice' ? (
                              <MultipleChoice
                                items={
                                  (formField.field?.options as Option[]) ?? []
                                }
                                question={formField.field?.label ?? ''}
                                selectedOptions={(
                                  form.getValues(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}.response`,
                                  ) ?? ''
                                )
                                  .split(', ')
                                  .filter(Boolean)}
                                onChange={(value) => {
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}`,
                                    {
                                      form_field_id: formField.field?.id ?? '',
                                      brief_id: brief.id,
                                      order_id: orderId,
                                      response: value,
                                    },
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
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}`,
                                    {
                                      form_field_id: formField.field?.id ?? '',
                                      brief_id: brief.id,
                                      order_id: orderId,
                                      response: responseValue,
                                    },
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
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}`,
                                    {
                                      form_field_id: formField.field?.id ?? '',
                                      brief_id: brief.id,
                                      order_id: orderId,
                                      response: responseValue,
                                    },
                                  );
                                }}
                              >
                                {field.value}
                              </Textarea>
                            ) : formField.field?.type === 'file' ? (
                              <UploadFileComponent
                                bucketName="orders"
                                uuid={uniqueId}
                                onFileIdsChange={(fileIds) => {
                                  const responseValues =
                                    handleFileIdsChange(fileIds);
                                  setFormResponse(
                                    currentFieldIndex,
                                    formField,
                                    brief.id,
                                    responseValues,
                                  );
                                }}
                              />
                            ) : formField.field?.type === 'date' ? (
                              <DatePicker
                                onDateChange={(selectedDate: Date) => {
                                  const responseValue = selectedDate;
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}`,
                                    {
                                      form_field_id: formField.field?.id ?? '',
                                      brief_id: brief.id,
                                      order_id: orderId,
                                      response: responseValue.toString(),
                                    },
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
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}.response`,
                                  ) ?? ''
                                }
                                onChange={(value) => {
                                  form.setValue(
                                    `${briefSetValuePrefix}.${briefResponseSufix}.${currentFieldIndex}`,
                                    {
                                      form_field_id: formField.field?.id ?? '',
                                      brief_id: brief.id,
                                      order_id: orderId,
                                      response: value,
                                    },
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
        ));
      })()}
    </div>
  );
};
