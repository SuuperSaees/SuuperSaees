import React from 'react';



import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';

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

export interface FormTitleComponentProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (index: number, field: 'label', value: string) => void;
  handleRemoveQuestion: (index: number) => void;
}
  
  const FormTitleComponent: React.FC<FormTitleComponentProps> = ({
    index,
    question,
    form,
    handleQuestionChange,
    handleRemoveQuestion,
  }) => {
    const { t } = useTranslation('briefs');
    return (
      <FormItem className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>{t('title.title')} {index + 1}</FormLabel>
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
                    maxWidth: '100%', 
                    overflowWrap: 'break-word', 
                    wordBreak: 'break-word', 
                  }}
                  placeholder={t('title.placeholder')}
                  className="text-gray-500 text-2xl font-semibold leading-9"
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
      </FormItem>
    );
  };
  
  export default FormTitleComponent;