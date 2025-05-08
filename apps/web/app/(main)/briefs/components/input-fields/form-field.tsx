'use client';

import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import {
  BriefsProvider,
} from '~/(main)/briefs/contexts/briefs-context';
import { ComponentProps } from '~/(main)/briefs/types/brief.types';

interface FormFieldProps extends ComponentProps {
  children: React.ReactNode;
}

export default function FormField({
  children,
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}: FormFieldProps) {
  const { t } = useTranslation();

  return (
    <FormFieldProvider
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem
          className="group relative flex w-full flex-col"
          onBlur={handleQuestionBlur}
        >
          <FormFieldProvider
            control={form.control}
            name={`questions.${index}.label`}
            render={({ field, fieldState }) => (
              <FormItem className="w-full">
                <FormControl>
                  <input
                    {...field}
                    value={question.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleQuestionChange(question.id, 'label', e.target.value)
                    }
                    onFocus={() =>
                      handleQuestionFocus &&
                      handleQuestionFocus(question.id, 'label')
                    }
                    placeholder={t('creation.form.labelPlaceholder')}
                    className="w-full border-none bg-transparent text-sm font-bold text-gray-600 focus:outline-none"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormFieldProvider
            control={form.control}
            name={`questions.${index}.description`}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  {field.value && (
                    <textarea
                      {...field}
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleQuestionChange(
                          question.id,
                          'description',
                          e.target.value,
                        )
                      }
                      onFocus={() =>
                        handleQuestionFocus &&
                        handleQuestionFocus(question.id, 'description')
                      }
                      placeholder={t('creation.form.descriptionPlaceholder')}
                      className="w-full resize-none border-none bg-transparent text-sm font-medium text-gray-500 focus:outline-none"
                    />
                  )}
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {children}

          <BriefsProvider.Options
            formFieldId={question.id}
            className="absolute right-0 top-0 ml-auto hidden group-hover:flex"
          />
        </FormItem>
      )}
    />
  );
}
