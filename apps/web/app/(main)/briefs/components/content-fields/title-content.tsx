import React from 'react';

import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { ComponentProps } from '~/(main)/briefs/types/brief.types';

import { BriefsProvider } from '../../contexts/briefs-context';

const FormTitleComponent: React.FC<ComponentProps> = ({
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
      
      control={form.control}
      name={`questions.${index}.label`}
      render={() => (
        <FormItem className="group relative flex w-full flex-col" onBlur={handleQuestionBlur}>
          <FormField
            control={form.control}
            name={`questions.${index}.label`}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <textarea
                    {...field}
                    value={question.label}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleQuestionChange(question.id, 'label', e.target.value)
                    }
                    placeholder={t('title.placeholder')}
                    className="w-full break-words bg-transparent text-2xl font-bold leading-9 text-gray-600"
                    rows={3}
                    onFocus={() => handleQuestionFocus && handleQuestionFocus(question.id, 'label')}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <BriefsProvider.Options
            formFieldId={question.id}
            className="absolute right-0 top-0 ml-auto hidden group-hover:flex"
          />
        </FormItem>
      )}
    />
  );
};

export default FormTitleComponent;
