'use client';

import React, { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import {
  addFormFieldsToBriefs,
  createBrief,
} from 'node_modules/@kit/team-accounts/src/server/actions/briefs/create/create-briefs';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { useBriefsContext } from '../contexts/briefs-context';
import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import FieldsetFields from './fieldset-fields';
import FieldsetInformation from './fieldset-information';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

type CreateBriefDialogProps = {
  propietaryOrganizationId: string;
  userRole: string;
  showFormFields?: boolean;
  showInfo?: boolean;
};

export type BriefCreationForm = z.infer<typeof briefCreationFormSchema>;

const BriefCreationForm = ({
  propietaryOrganizationId,
  userRole,
  showFormFields = true,
  showInfo = false,
}: CreateBriefDialogProps) => {
  const { t } = useTranslation('briefs'); // Translation hook for internationalization
  const router = useRouter();

  const { addFormField, formFields, brief } = useBriefsContext(); // Context to manage form fields

  // Initialize the form with Zod schema for validation and set default values
  const form = useForm<BriefCreationForm>({
    resolver: zodResolver(briefCreationFormSchema), // Resolver for Zod validation
    defaultValues: {
      name: '', // Default name field,
      description: '',
      image_url: '',
      questions: formFields, // Initialize questions with values from context,
      default_question: {
        label: 'Order title', // not editable
        description: '', // editable
        placeholder: 'Add a title...', // editable
        type: 'text-short', // not editable,
        position: 0
      },
    },
  });

  // Mutation to handle brief creation
  const createBriefsMutations = useMutation({
    mutationFn: async (values: z.infer<typeof briefCreationFormSchema>) => {
      // Create a new brief with the provided values
      const briefId = await createBrief({
        name: values.name,
        description: values.description,
        image_url: values.image_url,
        propietary_organization_id: propietaryOrganizationId, // Use organization ID from props
      });

      // If brief creation was successful, add associated form fields
      if (briefId?.id) {
        await addFormFieldsToBriefs(values.questions, briefId.id);
      } else {
        throw new Error('Failed to retrieve briefId'); // Error handling for brief creation failure
      }
    },
    onError: () => {
      // Show error toast notification on mutation failure
      toast('Error', { description: 'There was an error creating the brief.' });
    },
    onSuccess: () => {
      // Show success toast notification and redirect on successful brief creation
      toast('Success', { description: 'The brief has been created.' });
      router.push('/briefs'); // Redirect to briefs page
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof briefCreationFormSchema>) => {
    // join default question with values (questions)
    const newQuestionValues = [
      ...values.questions,
      values.default_question,
    ]
   
    const newValues = {
      ...values,
      questions: newQuestionValues,
    }

    createBriefsMutations.mutate(newValues); // Trigger the mutation with form values
  };

  // Handle adding a new question to the form
  const handleAddQuestion = () => {
    const newQuestion = addFormField('text-short'); // Create a new question field
    // Update the form's questions state with the new question
    form.setValue('questions', [...form.getValues('questions'), newQuestion]);
  };

  // Sync form state with context whenever formFields change
  useEffect(() => {
    form.setValue('questions', formFields); // Ensure form state stays in sync with context
    form.setValue('name', brief.name);
    form.setValue('description', brief.description);
    form.setValue('image_url', brief.image_url);
  }, [formFields, form, brief, brief.description, brief.name, brief.image_url]); // Re-run effect when formFields or form change


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="no-scrollbar flex h-full w-full flex-col space-y-8 overflow-y-auto"
      >
        {/* Brief Name Input */}
        {showInfo && <FieldsetInformation form={form} />}
  
        {/* Default and not editable input field */}
        {showFormFields && (
            <FormField
              control={form.control}
              name='default_question.description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-700">
                    {form.getValues().default_question.label}
                  </FormLabel>
                  <FormControl>
                    <ThemedInput
                      {...field}
                      placeholder={t('creation.form.defaultPlaceholder')}
                      className="focus-visible:ring-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        {showFormFields && (
          <>
            <FieldsetFields form={form} userRole={userRole} />
          </>
        )}
        {showFormFields && (
          <div className="fixed bottom-0 mt-auto flex h-fit w-full items-center gap-8 border-t border-gray-200 bg-white py-6">
            <ThemedButton type="submit" className="flex gap-2">
              <span>{t('creation.form.submit')}</span>
              {createBriefsMutations.isPending && <Spinner />}
            </ThemedButton>

            <ThemedButton type="button" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4" />
              {t('creation.form.addQuestion')}
            </ThemedButton>

            {/* here goes previsualization button */}
          </div>
        )}
      </form>
    </Form>
  );
};

export default BriefCreationForm;
