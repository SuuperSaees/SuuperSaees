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

import RadioOptions from '~/components/single-choice';
import { Brief } from '~/lib/brief.types';

import VideoDescriptionRenderer from './video-description-renderer';

export const OrderBriefs = ({
  briefs,
  form,
  orderId,
}: {
  briefs: Brief.BriefResponse[];
  form: UseFormReturn<
    {
      title: string;
      description: string;
      uuid: string;
      fileIds: string[];
      brief_responses?:
        | {
            response: string;
            form_field_id: string;
            brief_id: string;
            order_id: string;
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

  return (
    <div className="flex flex-col gap-8">
      {(() => {
        let uniqueIndexCounter = 0; // Initialize a counter outside the map functions

        return briefs?.map((brief) => (
          <div key={brief.id} className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">{brief.name}</h3>
            <div className="flex flex-col gap-8">
              {brief?.form_fields?.map((formField) => {
                const currentFieldIndex = uniqueIndexCounter++; // Increment the counter for each form field

                // Function to check if the description contains any video links (YouTube or similar)

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
                              options={formField.field?.options ?? []}
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
                          ) : (
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
                          )}
                        </FormControl>

                        <FormMessage />
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
