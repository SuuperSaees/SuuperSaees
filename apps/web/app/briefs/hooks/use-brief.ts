'use client';

import { Dispatch, SetStateAction, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Brief } from '~/lib/brief.types';
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
  const { t } = useTranslation('briefs');

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
        await updateBriefById({
          id: brief.id,
          name: values.name,
          description: values.description ?? null,
          image_url: values.image_url ?? null,
          propietary_organization_id: brief.propietary_organization_id,
        });
        await updateFormFieldsById(values.questions, brief.id);

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
        const briefId = await createBrief({
          name: values.name,
          description: values.description,
          image_url: values.image_url,
        });

        // If brief creation was successful, add associated form fields
        if (briefId?.id) {
          await addFormFieldsToBriefs(values.questions, briefId.id);
        } else {
          throw new Error('Failed to retrieve briefId'); // Error handling for brief creation failure
        }

        if (values.connected_services) {
          await addServiceBriefs(
            values.connected_services?.map((service) => ({
              service_id: service,
              brief_id: briefId.id,
            })),
          );
        }
      }
    },
    onError: (_, { isUpdate }) => {
      // Show error toast notification on mutation failure
      const errorMessage = isUpdate
        ? t('creation.form.errorUpdating')
        : t('creation.form.errorCreating');
      toast('Error', { description: errorMessage });
    },
    onSuccess: async (_, { isUpdate }) => {
      // Show success toast notification and redirect on successful brief creation
      const successMessage = isUpdate
        ? t('creation.form.updateSuccess')
        : t('creation.form.createSuccess');
      toast('Success', { description: successMessage });
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
