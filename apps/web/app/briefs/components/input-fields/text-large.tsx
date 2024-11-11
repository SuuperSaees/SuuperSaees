import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/ui/utils';

import { BriefsProvider } from '../../contexts/briefs-context';
import { ComponentProps } from '../../types/brief.types';

const TextLarge: React.FC<ComponentProps> = ({
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
                      placeholder={t('textLarge.title')}
                      className="border-none bg-transparent text-sm font-bold text-gray-600 focus:outline-none w-full"
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
                      {...field}
                      readOnly
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleQuestionChange(
                          question.id,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder={t('textLarge.description')}
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-500 focus:outline-none resize-none"
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
                        'w-full focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-400 bg-white',
                      )}
                      placeholder={t('textLarge.placeholder')}
                      value={question.placeholder ?? ''}
                      rows={5}
                      readOnly
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleQuestionChange(
                          question.id,
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
            className="ml-auto group-hover:flex hidden absolute right-0 top-0"
          />
        </FormItem>
      )}
    />
  );
};

export default TextLarge;
