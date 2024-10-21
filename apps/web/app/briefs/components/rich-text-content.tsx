import React from 'react';

import { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import RichTextEditor from '~/components/ui/rich-text-editor';

import { BriefsProvider} from '../contexts/briefs-context';
import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface FormRichTextComponentProps {
  index: number;
  question?: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange?: (content: string) => void;
  handleRemoveQuestion: (index: number) => void;
  userRole: string;
  inSidebar?: boolean;
}

const FormRichTextComponent: React.FC<FormRichTextComponentProps> = ({
  index,
  form,
  userRole,
  inSidebar = false,
  question,
  handleQuestionChange
}) => {

  return (
    <FormField
      control={form.control}
      name={`questions.${index}.label`}
      render={({ field, fieldState }) => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <div className="flex flex-col gap-2">
            <FormControl>
              <RichTextEditor
                {...field}
                content={question?.label}
                onChange={handleQuestionChange}
                userRole={userRole}
                hideSubmitButton={true}
                showToolbar={inSidebar}
                isEditable={inSidebar ? true : false}
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </div>
          {!inSidebar ? (
            <BriefsProvider.Options formFieldId={index} className="ml-auto" />
          ) : (
            <></>
          )}
        </FormItem>
      )}
    />
  );
};

export default FormRichTextComponent;
