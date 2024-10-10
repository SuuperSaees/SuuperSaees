import { X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/ui/utils';

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
  handleRemoveQuestion,
}) => {
  const { t } = useTranslation('briefs');
  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FormLabel>
                {t('creation.form.questionLabel')} {index + 1}
              </FormLabel>
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

            <FormField
              control={form.control}
              name={`questions.${index}.label`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      value={question.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(index, 'label', e.target.value)
                      }
                      style={{
                        width: `${Math.max(question.label.length, t('textLarge.title').length) + 1}ch`,
                      }}
                      placeholder={t('textLarge.title')}
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none"
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
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      style={{
                        width: `${Math.max(question.description!.length, t('textLarge.description').length) + 1}ch`,
                      }}
                      placeholder={t('textLarge.description')}
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none"
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
                        'focus-visible:ring-0 focus-visible:ring-offset-0',
                      )}

                      placeholder={question.placeholder ?? ''}
                      rows={5}
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
        </FormItem>
      )}
    />
  );
};

export default TextLarge;
