'use client';

import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import {
  BriefsProvider,
  FormField as FormFieldType,
} from '../contexts/briefs-context';
import { BriefCreationForm } from './brief-creation-form';

export interface FormFieldShortTextProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'label' | 'description' | 'placeholder',
    value: string,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

export function FormFieldShortText({
  index,
  question,
  form,
  handleQuestionChange,
}: FormFieldShortTextProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <FormLabel>
            {t('creation.form.questionLabel')} {index + 1}
          </FormLabel>

          {/* Label Input */}
          <FormField
            control={form.control}
            name={`questions.${index}.label`}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <ThemedInput
                    {...field}
                    value={question.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleQuestionChange(index, 'label', e.target.value)
                    }
                    placeholder={t('creation.form.labelPlaceholder')}
                    className="focus-visible:ring-none"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Description Input */}
          <FormField
            control={form.control}
            name={`questions.${index}.description`}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <ThemedInput
                    {...field}
                    value={question.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleQuestionChange(index, 'description', e.target.value)
                    }
                    placeholder={t('creation.form.descriptionPlaceholder')}
                    className="focus-visible:ring-none"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Placeholder Input */}
          <FormField
            control={form.control}
            name={`questions.${index}.placeholder`}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <ThemedInput
                    {...field}
                    value={question.placeholder}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleQuestionChange(index, 'placeholder', e.target.value)
                    }
                    placeholder={t('creation.form.placeholderPlaceholder')}
                    className="focus-visible:ring-none"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <BriefsProvider.Options
            formFieldId={question.id}
            className="ml-auto"
          />
        </FormItem>
      )}
    />
  );
}