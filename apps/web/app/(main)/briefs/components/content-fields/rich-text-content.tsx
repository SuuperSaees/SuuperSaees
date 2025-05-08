import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import RichTextEditor from '~/components/ui/rich-text-editor';

import { BriefsProvider } from '../../contexts/briefs-context';
import { ComponentProps } from '../../types/brief.types';

const FormRichTextComponent: React.FC<ComponentProps> = ({
  index,
  form,
  userRole,
  inSidebar = false,
  question,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}) => {

  return (
    <FormField
      control={form.control}
      name={`questions.${index}.label`}
      render={({ fieldState, field }) => (
        <FormItem className="flex w-full flex-col group relative" >
            <FormControl>
              <RichTextEditor
                {...field}
                content={question?.label}
                onChange={handleQuestionChange}
                userRole={userRole ?? ''}
                hideSubmitButton={true}
                showToolbar={true}
                isEditable={true}
                className='text-gray-600 text-sm bg-white'
                onFocus={() => handleQuestionFocus && handleQuestionFocus(question.id, 'label')}
                onBlur={handleQuestionBlur}
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          {!inSidebar ? (
            <BriefsProvider.Options formFieldId={question?.id ?? 'create-form-field-' + index} className="ml-auto group-hover:flex hidden absolute right-0 top-0" />
          ) : (
            <></>
          )}
        </FormItem>
      )}
    />
  );
};

export default FormRichTextComponent;
