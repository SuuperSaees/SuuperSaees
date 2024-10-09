import React, { useRef, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormItem, FormLabel, FormMessage, FormField } from '@kit/ui/form';
import { Button } from '@kit/ui/button';
import { FormField as FormFieldType } from '../contexts/briefs-context';
import { BriefCreationForm } from './brief-creation-form';
import { X } from 'lucide-react';

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
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
          <FormLabel>Rich Text {index + 1}</FormLabel>
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
                  value={question.label}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleQuestionChange(index, 'label', e.target.value)
                  }
                  placeholder="Enter the title"
                  className="text-gray-500 text-base font-normal leading-7 resize-none w-full h-60"
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