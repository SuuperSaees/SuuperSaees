'use client';

import { Dispatch, SetStateAction, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Brief } from '~/lib/brief.types';
import { handleResponse } from '~/lib/response/handle-response';
import { Service } from '~/lib/services.types';
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

import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import { FormField } from '../types/brief.types';

export const useBrief = (
  setFormFields: Dispatch<SetStateAction<FormField[]>>,
) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const defaultBrief = {
    name: '',
    description: '',
    services: [],
  };
  const [brief, setBrief] = useState<
    Brief.Insert & {
      services: Service.Response[];
    }
  >(defaultBrief);
  const { t } = useTranslation(['briefs', 'responses']);

  function updateBrief(updatedBrief: Brief.Insert) {
    setBrief(updatedBrief);
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
          id: brief.id,
          name: values.name,
          description: values.description ?? null,
          image_url: values.image_url ?? null,
          propietary_organization_id: brief.propietary_organization_id,
        });
        await handleResponse(res, 'briefs', t);

        await handleResponse(
          await updateFormFieldsById(values.questions, brief.id),
          'briefs',
          t,
        );

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
      router.push('/services?briefs=true'); // Redirect to briefs page

      await queryClient.invalidateQueries({
        queryKey: ['briefs'],
      });
      // reset
      setBrief(defaultBrief);
      setFormFields([]);
    },
  });

  return {
    brief,
    briefMutation,
    setBrief,
    updateBrief,
  };
};
