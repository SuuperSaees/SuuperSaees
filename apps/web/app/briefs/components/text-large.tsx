import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/ui/utils';

import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface FormFieldTextLargeProps {
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

const TextLarge: React.FC<FormFieldTextLargeProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
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
                        handleQuestionChange(index, 'label', e.target.value)
                      }
                      placeholder={t('textLarge.title')}
                      className="border-none bg-transparent text-sm font-medium text-gray-600 focus:outline-none w-full"
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
                    <input
                      {...field}
                      readOnly
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('textLarge.description')}
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`questions.${index}.placeholder`}
              render={({ fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className={cn(
                        'w-full focus-visible:ring-0 focus-visible:ring-offset-0',
                      )}
                      placeholder={t('textLarge.placeholder')}
                      value={question.placeholder}
                      rows={5}
                      readOnly
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleQuestionChange(
                          index,
                          'placeholder',
                          e.target.value,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          <BriefsProvider.Options
            formFieldId={question.id}
            className="ml-auto"
          />
        </FormItem>
      )}
    />
  );
};

export default TextLarge;
