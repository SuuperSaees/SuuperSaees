'use client';

import React, { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import {
  addFormFieldsToBriefs,
  createBrief,
} from 'node_modules/@kit/team-accounts/src/server/actions/briefs/create/create-briefs';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { useBriefsContext } from '../contexts/briefs-context';
import { isContentType, isInputType } from '../utils/type-guards';
import { Sortable } from './sortable';

type CreateBriefDialogProps = {
  propietaryOrganizationId: string;
  userRole: string;
};
const briefCreationFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(200, { message: 'Name must be at most 200 characters.' }),
  questions: z.array(
    z.object({
      position: z.number(),
      label: z.string().min(1, { message: 'Question label cannot be empty.' }),
      description: z.string().optional().nullable(),
      placeholder: z.string().optional().nullable(),
      type: z
        .enum([
          'text',
          'text-short',
          'text-large',
          'select',
          'multiple_choice',
          'date',
          'number',
          'file',
          'dropdown',
          'h1',
          'h2',
          'h3',
          'h4',
          'rich-text',
          'image',
          'video',
        ])
        .optional(), // Allowing multiple types
      alert_message: z.string().optional().nullable(),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
            selected: z.boolean().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export type BriefCreationForm = z.infer<typeof briefCreationFormSchema>;

const BriefCreationForm = ({
  propietaryOrganizationId,
  userRole,
}: CreateBriefDialogProps) => {
  const { t } = useTranslation('briefs'); // Translation hook for internationalization
  const router = useRouter();

  const {
    addFormField,
    removeFormField,
    updateFormField,
    formFields,
    inputsMap,
    contentMap,
  } = useBriefsContext(); // Context to manage form fields

  // Initialize the form with Zod schema for validation and set default values
  const form = useForm<BriefCreationForm>({
    resolver: zodResolver(briefCreationFormSchema), // Resolver for Zod validation
    defaultValues: {
      name: '', // Default name field
      questions: formFields, // Initialize questions with values from context
    },
  });

  // Mutation to handle brief creation
  const createBriefsMutations = useMutation({
    mutationFn: async (values: z.infer<typeof briefCreationFormSchema>) => {
      // Create a new brief with the provided values
      const briefId = await createBrief({
        name: values.name,
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
    createBriefsMutations.mutate(values); // Trigger the mutation with form values
  };

  // Handle adding a new question to the form
  const handleAddQuestion = () => {
    const newQuestion = addFormField('text-short'); // Create a new question field
    // Update the form's questions state with the new question
    form.setValue('questions', [...form.getValues('questions'), newQuestion]);
  };

  // Handle changes to a specific question field
  const handleQuestionChange = (
    index: number,
    field:
      | 'label'
      | 'description'
      | 'placeholder'
      | `options.${number}.selected`,
    value: string | boolean | Date,
  ) => {
    // Update question in context if it exists
    if (formFields[index]) {
      updateFormField(index, { ...formFields[index], [field]: value }); // Update context field
      const updatedQuestions = form.getValues('questions'); // Get current form questions

      // If the question exists in the form, update its value
      if (updatedQuestions[index]) {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value,
        };
        form.setValue('questions', updatedQuestions); // Update form state
      }
    }
  };

  // Handle removing a question from the form
  const handleRemoveQuestion = (index: number) => {
    removeFormField(index); // Remove field from context
    const currentQuestions = form.getValues('questions'); // Get current questions
    // Filter out the question to be removed
    const newQuestions = currentQuestions.filter((_, i) => i !== index);
    form.setValue('questions', newQuestions); // Update form state with the new questions array
  };

  // Sync form state with context whenever formFields change
  useEffect(() => {
    form.setValue('questions', formFields); // Ensure form state stays in sync with context
  }, [formFields, form]); // Re-run effect when formFields or form change
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8 h-full">
        {/* Brief Name Input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('creation.form.titleLabel')}</FormLabel>
              <FormControl>
                <ThemedInput
                  {...field}
                  placeholder={t('creation.form.titlePlaceholder')}
                  className="focus-visible:ring-none"
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />

        {formFields.map((question, index) => {
          if (question.type) {
            const inputEntry = isInputType(question.type)
              ? inputsMap.get(question.type)
              : isContentType(question.type)
                ? contentMap.get(question.type)
                : undefined;
            const FormFieldComponent = inputEntry?.component;
            if (!FormFieldComponent) {
              return null; // If no component found, skip rendering
            }
            // Check if FormFieldComponent is a function
            if (typeof FormFieldComponent === 'function') {
              return (
  
                <Sortable key={'q' + index} id={question.id}>
                  <FormFieldComponent
                    index={index}
                    question={question}
                    form={form}
                    handleQuestionChange={handleQuestionChange}
                    handleRemoveQuestion={handleRemoveQuestion}
                    userRole={userRole}
                  />
                </Sortable>
              );
            }
            // If it's a JSX element, render it directly
            return <div key={'q' + index}>{FormFieldComponent}</div>;
          }
          return null;
        })}

        {/* Add Question Button */}
        <div className="flex items-center justify-center">
          <ThemedButton type="button" onClick={handleAddQuestion}>
            <Plus className="h-4 w-4" />
            {t('creation.form.addQuestion')}
          </ThemedButton>
        </div>

        {/* Submit Button */}
        <ThemedButton type="submit" className="flex gap-2">
          <span>{t('creation.form.submit')}</span>
          {createBriefsMutations.isPending && <Spinner />}
        </ThemedButton>
      </form>
    </Form>
  );
};

export default BriefCreationForm;
