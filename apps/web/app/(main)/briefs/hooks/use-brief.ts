'use client';

import { Dispatch, SetStateAction, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { handleResponse } from '~/lib/response/handle-response';
import {
  addFormFieldsToBriefs,
  addServiceBriefs,
  createBrief,
} from '~/team-accounts/src/server/actions/briefs/create/create-briefs';
import {
  updateBriefById,
  updateFormFieldsById,
  updateServiceBriefs,
} from '~/team-accounts/src/server/actions/briefs/update/update-brief';

import { BriefCreationForm } from '../components/brief-creation-form';
import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import { Brief, FormField } from '../types/brief.types';

export const useBrief = (
  setFormFields: Dispatch<SetStateAction<FormField[]>>,
  form: UseFormReturn<BriefCreationForm>,
) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isUpdate =
    pathname.startsWith('/briefs/') && pathname.length > '/briefs/'.length;
  const defaultBrief = {
    name: '',
    description: '',
    services: [],
  };
  const [brief, setBrief] = useState<Brief>(defaultBrief);
  const { t } = useTranslation(['briefs', 'responses']);

  function updateBrief(updatedBrief: Brief) {
    setBrief(updatedBrief);
  }

  async function updateBriefFormFields(
    values: z.infer<typeof briefCreationFormSchema>['questions'],
  ) {
    // Remove the id if start with 'create-form-field-'
    // verify theres's no error on the form
    // Perform validation on the reordered values
    form.reset(
      { ...form.getValues(), questions: values },
      { keepErrors: true },
    );
    await form.trigger('questions');
    const hasErrors = form.formState.errors.questions?.length;

    if (isUpdate && !hasErrors) {
      try {
        const formattedFormFields = [
          ...values.filter((v) => v.position !== 0),
          form.getValues('default_question'),
        ]?.map((question) => {
          const newQuestion = { ...question };
          if (newQuestion.id?.startsWith('create-form-field-')) {
            newQuestion.id = undefined;
          }
          return newQuestion;
        });

        await handleResponse(
          await updateFormFieldsById(formattedFormFields, brief.id ?? ''),
          'briefs',
          t,
          {showSuccessToast: false}
        );
      } catch (error) {
        console.error('Error updating brief form fields from client');
        throw error;
      }
    }
  }

  // Mutation to handle brief creation
  const briefMutation = useMutation({
    mutationFn: async ({
      values,
      isUpdate,
    }: {
      values: z.infer<typeof briefCreationFormSchema>;
      isUpdate?: boolean;
    }) => {
      if (isUpdate) {
        const res = await updateBriefById({
          id: brief.id ?? '',
          name: values.name,
          description: values.description ?? null,
          image_url: values.image_url ?? null,
        });
        await handleResponse(res, 'briefs', t);

        await updateBriefFormFields(values.questions);

        // Call updateServiceBriefs to handle connected services
        await updateServiceBriefs(
          brief.id ?? '',
          values.connected_services?.map((service) => ({
            service_id: service,
            brief_id: brief.id,
          })),
        );
      } else {
        // Create a new brief with the provided values
        const res = await createBrief({
          name: values.name,
          description: values.description,
          image_url: values.image_url,
        });

        await handleResponse(res, 'briefs', t);

        const brief = res.success?.data;

        // If brief creation was successful, add associated form fields
        if (brief?.id) {
          await addFormFieldsToBriefs(values.questions, brief.id);
        } else {
          throw new Error('Failed to retrieve brief'); // Error handling for brief creation failure
        }

        if (values.connected_services) {
          const res = await addServiceBriefs(
            values.connected_services?.map((service) => ({
              service_id: service,
              brief_id: brief.id,
            })),
          );
          await handleResponse(res, 'briefs', t);
        }
      }
    },

    onSuccess: async () => {
      // Mark all briefs queries as invalidated
      await queryClient.invalidateQueries({
        queryKey: ['briefs'],
        exact: false,
      });

      router.push('/briefs'); // Redirect to briefs page
    },
  });

  return {
    brief,
    briefMutation,
    setBrief,
    updateBrief,
    updateBriefFormFields,
  };
};
