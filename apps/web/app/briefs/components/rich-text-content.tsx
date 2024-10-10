import React, { useEffect, useRef } from 'react';

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

import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface FormRichTextComponentProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (index: number, field: 'label', value: string) => void;
  handleRemoveQuestion: (index: number) => void;
}

const FormRichTextComponent: React.FC<FormRichTextComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleRemoveQuestion,
}) => {
  const { t } = useTranslation('briefs');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight(); 
  }, [question.label]);

  return (
    <FormItem className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>
          {t('richText.title')} {index + 1}
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
              <textarea
                {...field}
                ref={textareaRef}
                value={question.label}
                onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  handleQuestionChange(index, 'label', e.target.value);
                  adjustTextareaHeight();
                }}
                placeholder={t('richText.placeholder')}
                className="w-full resize-none text-base font-normal leading-7 text-gray-500"
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
    </FormItem>
  );
};

export default FormRichTextComponent;

