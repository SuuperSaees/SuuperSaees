'use client';

import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { BriefsProvider } from '../../contexts/briefs-context';
import { ComponentProps} from '../../types/brief.types';

export function FormFieldShortText({
  index,
  question,
  form,
  handleQuestionChange,
}: ComponentProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4 group relative">
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name={`questions.${index}.label`}
          
              render={({ field, fieldState }) => (
                <FormItem className='w-full'>
                  <FormControl>
                    <input
                      {...field}
                      readOnly
                      value={question.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(question.id, 'label', e.target.value)
                      }
                      placeholder={t('creation.form.labelPlaceholder')}
                      className="bg-transparent border-none text-sm font-bold text-gray-600 focus:outline-none w-full"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`questions.${index}.description`}
      
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <textarea
                      readOnly
                      {...field}
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleQuestionChange(
                          question.id,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('creation.form.descriptionPlaceholder')}
                      className="bg-transparent w-full border-none text-sm font-medium text-gray-500 focus:outline-none resize-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`questions.${index}.placeholder`}
         
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ThemedInput
                      readOnly
                      {...field}
                      value={question.placeholder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          question.id,
                          'placeholder',
                          e.target.value,
                        )
                      }
                      placeholder={t('creation.form.placeholderPlaceholder')}
                      className="focus-visible:ring-none text-gray-400 bg-white"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          <BriefsProvider.Options
            formFieldId={question.id}
            className="ml-auto group-hover:flex hidden absolute right-0 top-0"
          />
        </FormItem>
      )}
    />
  );
}
