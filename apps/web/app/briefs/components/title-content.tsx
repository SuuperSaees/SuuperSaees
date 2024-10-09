import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormItem, FormLabel, FormMessage, FormField } from '@kit/ui/form';
import { Button } from '@kit/ui/button';
import { FormField as FormFieldType } from '../contexts/briefs-context';
import { BriefCreationForm } from './brief-creation-form';
import { X } from 'lucide-react';

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
    return (
      <FormItem className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Title {index + 1}</FormLabel>
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
                  placeholder="Enter the title"
                  className="text-gray-500 font-inter text-2xl font-semibold leading-9"
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