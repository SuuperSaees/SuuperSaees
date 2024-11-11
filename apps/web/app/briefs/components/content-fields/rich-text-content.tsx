import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import RichTextEditor from '~/components/ui/rich-text-editor';

import { BriefsProvider} from '../../contexts/briefs-context';
import { ComponentProps } from '../../types/brief.types';

const FormRichTextComponent: React.FC<ComponentProps> = ({
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
        <FormItem className="flex w-full flex-col gap-2 space-y-4 group relative">
          <div className="flex flex-col gap-2">
            <FormControl>
              <RichTextEditor
                {...field}
                content={question?.label}
                onChange={handleQuestionChange}
                userRole={userRole ?? ''}
                hideSubmitButton={true}
                showToolbar={inSidebar}
                isEditable={inSidebar ? true : false}
                className='text-gray-600 text-sm'
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </div>
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
