'use client';

import { Dispatch, SetStateAction, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Brief } from '~/lib/brief.types';
import {
  addFormFieldsToBriefs,
  createBrief,
} from '~/team-accounts/src/server/actions/briefs/create/create-briefs';
import {
  updateBriefById,
  updateFormFieldsById,
} from '~/team-accounts/src/server/actions/briefs/update/update-brief';

import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import { FormField } from '../types/brief.types';

export const useBrief = (
  setFormFields: Dispatch<SetStateAction<FormField[]>>,
) => {
  const router = useRouter();

  const defaultBrief = {
    name: '',
    description: '',
  };
  const [brief, setBrief] = useState<Brief.Insert>(defaultBrief);
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
      }
    },
    onError: (_, { isUpdate }) => {
      // Show error toast notification on mutation failure
      const errorMessage = isUpdate
        ? t('creation.form.errorUpdating')
        : t('creation.form.errorCreating');
      toast('Error', { description: errorMessage });
    },
    onSuccess: (_, { isUpdate }) => {
      // Show success toast notification and redirect on successful brief creation
      const successMessage = isUpdate
        ? t('creation.form.updateSuccess')
        : t('creation.form.createSuccess');
      toast('Success', { description: successMessage });
      router.push('/briefs'); // Redirect to briefs page
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
