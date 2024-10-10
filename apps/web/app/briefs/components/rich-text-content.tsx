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
import RichTextEditor from '~/components/ui/rich-text-editor';

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
  handleRemoveQuestion,
  userRole,
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

  const currentValue = form.getValues(`questions.${index}.label`);

  const handleChange = (richText: string) => {
    form.setValue(`questions.${index}.label`, richText);
  };

  return (
    <>
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
                <RichTextEditor
                  {...field}
                  content={currentValue} 
                  onComplete={() => {}} 
                  onChange={handleChange} 
                  userRole={userRole}
                  hideSubmitButton={true}
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
      </FormItem>
    </>
  );
};

export default FormRichTextComponent;
