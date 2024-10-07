'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';
import { addFormFieldsToBriefs, createBrief } from 'node_modules/@kit/team-accounts/src/server/actions/briefs/create/create-briefs';
import { Plus, X } from 'lucide-react';
import { Button } from '@kit/ui/button';


type CreateBriefDialogProps = {
  propietaryOrganizationId: string;
};

const BriefCreationForm = ({
  propietaryOrganizationId,
}: CreateBriefDialogProps) => {
  const { t } = useTranslation('briefs');

  const briefCreationFormSchema = z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(200, {
        message: 'Name must be at most 200 characters.',
      }),
    questions: z.array(
      z.object({
        label: z.string().min(1, { message: 'Question label cannot be empty.' }),
        description: z.string().optional(), 
        placeholder: z.string().optional(), 
        type: z.literal("text")
      })
    ),
  });

  const form = useForm<z.infer<typeof briefCreationFormSchema>>({
    resolver: zodResolver(briefCreationFormSchema),
    defaultValues: {
      name: '',
      questions: [{ label: '', description: '', placeholder: '', type: "text"}],
    },
  });

  const [questions, setQuestions] = useState([{ 
    label: '', 
    description: '', 
    placeholder: '', 
    type: "text" as const
  }]);

  const handleAddQuestion = () => {
    const newQuestion = { 
      label: '', 
      description: '', 
      placeholder: '', 
      type: "text" as const 
    };
    setQuestions([...questions, newQuestion]);
    const currentQuestions = form.getValues('questions');
    form.setValue('questions', [...currentQuestions, newQuestion]);
  };

  const handleQuestionChange = (index: number, field: 'label' | 'description' | 'placeholder', value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index]!,
      [field]: value,
      type: "text" // Ensure type remains "text"
    };
    setQuestions(updatedQuestions);
    form.setValue(`questions.${index}.${field}`, value);
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    const currentQuestions = form.getValues('questions');
    const newQuestions = currentQuestions.filter((_, i) => i !== index);
    form.setValue('questions', newQuestions);
  };

  const createBriefsMutations = useMutation({
    mutationFn: async (values: z.infer<typeof briefCreationFormSchema>) => {
      const newBrief = {
        name: values.name,
        propietary_organization_id: propietaryOrganizationId,
      };
      const briefId = await createBrief(newBrief);
      if (briefId?.id) {
        await addFormFieldsToBriefs(values.questions, briefId.id);
      } else {
        throw new Error('Failed to retrieve briefId');
      }
    },
    onError: () => {
      toast('Error', {
        description: 'There was an error creating the brief.',
      });
    },
    onSuccess: () => {
      toast('Success', {
        description: 'The brief has been created.',
      });
      window.location.href = '/briefs';
    },
  });

  const onSubmit = (values: z.infer<typeof briefCreationFormSchema>) => {
    createBriefsMutations.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('creation.form.titleLabel')}</FormLabel>
              <FormControl>
                <ThemedInput
                  {...field}
                  placeholder={t('creation.form.titlePlaceholder')}
                  className="focus-visible:ring-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {questions.map((question, index) => (
          <FormItem key={index} className="space-y-4">
            <div className="flex flex-col gap-2">
                <div className='flex items-center justify-between'>
                    <FormLabel>{t('creation.form.questionLabel')} {index + 1}</FormLabel>
                    {index > 0 && (
                        <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleRemoveQuestion(index)}
                        >
                        <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

              <FormControl>
                <ThemedInput
                  value={question.label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuestionChange(index, 'label', e.target.value)}
                  placeholder={t('creation.form.labelPlaceholder')}
                  className="focus-visible:ring-none"
                />
              </FormControl>

              <FormControl>
                <ThemedInput
                  value={question.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuestionChange(index, 'description', e.target.value)}
                  placeholder={t('creation.form.descriptionPlaceholder')}
                  className="focus-visible:ring-none"
                />
              </FormControl>

              <FormControl>
                <ThemedInput
                  value={question.placeholder}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuestionChange(index, 'placeholder', e.target.value)}
                  placeholder={t('creation.form.placeholderPlaceholder')}
                  className="focus-visible:ring-none"
                />
              </FormControl>
            </div>
          </FormItem>
        ))}

        <div className="flex justify-center items-center">
          <ThemedButton type="button" onClick={handleAddQuestion}>
            <Plus className="h-4 w-4" />
            {t('creation.form.addQuestion')}
          </ThemedButton>
        </div>

        <ThemedButton type="submit" className="flex gap-2">
          <span>{t('creation.form.submit')}</span>
          {createBriefsMutations.isPending && (
            <Spinner className="h-4 w-4 text-white" />
          )}
        </ThemedButton>
      </form>
    </Form>
  );
};

export default BriefCreationForm;
