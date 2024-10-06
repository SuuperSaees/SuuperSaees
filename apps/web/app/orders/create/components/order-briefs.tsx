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

import RadioOptions from '~/components/single-choice';
import { Brief } from '~/lib/brief.types';

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
  const containsVideo = (description: string) => {
    const videoRegex =
      /(youtube\.com|youtu\.be|instagram\.com|drive\.google\.com)/;
    return videoRegex.test(description);
  };
  const notValidFormTypes = new Set(['h1', 'h2', 'h3', 'h4']);

  const Tag = ({ Type, children, className }: TagProps) => {
    return React.createElement(Type, { className }, children);
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
                    // Use the unique counter as the index for brief_responses
                    name={`brief_responses.${currentFieldIndex}.response`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{formField.field?.label}</FormLabel>

                        {formField.field?.description &&
                          // Conditionally render video or plain description
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
                              // Set the currently selected option
                              selectedOption={
                                form.getValues(
                                  `brief_responses.${currentFieldIndex}.response`,
                                ) || '' // Ensure a selected option exists
                              }
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

                                // Update the form value with correct `brief_id`, `form_field_id`, and `response`
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

                                // Update the form value with correct `brief_id`, `form_field_id`, and `response`
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
