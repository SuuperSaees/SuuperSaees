'use client';

import { zodResolver } from '@hookform/resolvers/zod';
// import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings"
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

interface InputProps {
  question: { description?: string; label: string; placeholder?: string };
}

export function InputForm({ question }: InputProps) {
  const { t } = useTranslation('briefs');

  const FormSchema = z.object({
    answer: z
      .string()
      .min(2, {
        message: `${t('validation.minCharacters')}`,
      })
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      answer: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success(`Form submitted successfully ${JSON.stringify(data)}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question.label}</FormLabel>

              <FormControl>
                <ThemedInput
                  placeholder={
                    question.placeholder ? question.placeholder : undefined
                  }
                  {...field}
                />
              </FormControl>

              {question.description && (
                <FormDescription>{question.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <ThemedButton type="submit">Submit</ThemedButton> */}
      </form>
    </Form>
  );
}
