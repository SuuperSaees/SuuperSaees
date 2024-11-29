import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { cn } from '@kit/ui/utils';

import { ComponentProps } from '../../types/brief.types';
import FormField from './form-field';
import { ThemedTextarea } from 'node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings';

const TextLarge: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}) => {
  const { t } = useTranslation('briefs');
  return (
    <FormField
      index={index}
      question={question}
      form={form}
      handleQuestionChange={handleQuestionChange}
      handleQuestionFocus={handleQuestionFocus}
      handleQuestionBlur={handleQuestionBlur}
    >
      <FormFieldProvider
        control={form.control}
        name={`questions.${index}.placeholder`}
        render={({ fieldState }) => (
          <FormItem>
            <FormControl>
              <ThemedTextarea
                className={cn(
                  'w-full bg-white text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-none',
                )}
                placeholder={t('textLarge.placeholder')}
                value={question.placeholder ?? ''}
                rows={5}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleQuestionChange(
                    question.id,
                    'placeholder',
                    e.target.value,
                  )
                }
                onFocus={() => handleQuestionFocus && handleQuestionFocus(question.id, 'placeholder')}
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
    </FormField>
  );
};

export default TextLarge;
