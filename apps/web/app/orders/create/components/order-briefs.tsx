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

import { SingleChoiceDropdown } from '~/components/dropdown';
import { MultipleChoice } from '~/components/multiple-choice';
import RadioOptions from '~/components/single-choice';
import UploadFileComponent from '~/components/ui/files-input';
import { Brief } from '~/lib/brief.types';
import { containsVideo } from '~/utils/contains-video';
import { generateUUID } from '~/utils/generate-uuid';

import VideoDescriptionRenderer from './video-description-renderer';

type ValidElements = keyof JSX.IntrinsicElements;

interface TagProps {
  Type: ValidElements;
  children: React.ReactNode;
  className?: string;
}

type Option = {
  value: string;
  label: string;
};

export const OrderBriefs = ({
  briefs,
  form,
  orderId,
}: {
  briefs: Brief.BriefResponse[];
  form: UseFormReturn<
    {
      uuid: string;
      title: string;
      fileIds: string[];
      description?: string | undefined;
      brief_responses?:
        | {
            form_field_id: string;
            brief_id: string;
            order_id: string;
            response: string;
          }[]
        | undefined;
    },
    unknown,
    undefined
  >;
  orderId: string;
}) => {
  const notValidFormTypes = new Set(['h1', 'h2', 'h3', 'h4']);

  const Tag = ({ Type, children, className }: TagProps) => {
    return React.createElement(Type, { className }, children);
  };

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
    form.setValue(`brief_responses.${currentFieldIndex}`, {
      form_field_id: formField.field?.id ?? '',
      brief_id: briefId,
      order_id: orderId,
      response: responseValue,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {(() => {
        let uniqueIndexCounter = 0; // Initialize a counter outside the map functions

        return briefs?.map((brief) => (
          <div key={brief.id} className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">{brief.name}</h3>
            <div className="flex flex-col gap-8">
              {brief?.form_fields?.map((formField) => {
                const currentFieldIndex = notValidFormTypes.has(
                  formField.field?.type ?? '',
                )
                  ? uniqueIndexCounter
                  : uniqueIndexCounter++; // Increment the counter for each form field

                // Function to check if the description contains any video links (YouTube or similar)
                if (notValidFormTypes.has(formField.field?.type ?? '')) {
                  return (
                    <Tag
                      Type={(formField.field?.type as ValidElements) ?? 'p'}
                      key={formField.field?.id}
                      className="text-lg font-bold"
                    >
                      {formField.field?.label}
                    </Tag>
                  );
                }
                return (
                  <FormField
                    key={formField.field?.id}
                    control={form.control}
                    name={`brief_responses.${currentFieldIndex}.response`}
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
                                  `brief_responses.${currentFieldIndex}`,
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
                                  `brief_responses.${currentFieldIndex}.response`,
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
                                  `brief_responses.${currentFieldIndex}.response`,
                                ) ?? ''
                              )
                                .split(', ')
                                .filter(Boolean)}
                              onChange={(value) => {
                                form.setValue(
                                  `brief_responses.${currentFieldIndex}`,
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
                                  `brief_responses.${currentFieldIndex}`,
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
                                  `brief_responses.${currentFieldIndex}`,
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
                            <ThemedInput
                              type="date"
                              placeholder={
                                formField.field?.placeholder ?? undefined
                              }
                              {...field}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => {
                                const responseValue = e.target.value;
                                form.setValue(
                                  `brief_responses.${currentFieldIndex}`,
                                  {
                                    form_field_id: formField.field?.id ?? '',
                                    brief_id: brief.id,
                                    order_id: orderId,
                                    response: responseValue,
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
                                  `brief_responses.${currentFieldIndex}.response`,
                                ) ?? ''
                              }
                              onChange={(value) => {
                                form.setValue(
                                  `brief_responses.${currentFieldIndex}`,
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
