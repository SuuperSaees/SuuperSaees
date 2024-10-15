import React from 'react';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import RichTextEditor from '~/components/ui/rich-text-editor';

import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface FormRichTextComponentProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange?: (index: number, field: 'label', value: string) => void;
  handleRemoveQuestion: (index: number) => void;
  userRole: string;
}

const FormRichTextComponent: React.FC<FormRichTextComponentProps> = ({
  index,
  question,
  form,
  userRole,
}) => {
  const { t } = useTranslation('briefs');

  const currentValue = form.getValues(`questions.${index}.label`);

  const handleChange = (richText: string) => {
    form.setValue(`questions.${index}.label`, richText);
  };

  return (
    <FormField
      control={form.control}
      name={`questions.${index}.label`}
      render={({ field, fieldState }) => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <div className="flex flex-col gap-2">
            <FormLabel>
              {t('richText.title')} {index + 1}
            </FormLabel>
            <FormControl>
              <RichTextEditor
                {...field}
                content={currentValue}
                onChange={handleChange}
                userRole={userRole}
                hideSubmitButton={true}
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
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

export default FormRichTextComponent;
