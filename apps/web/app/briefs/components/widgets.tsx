'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';

import { useBriefsContext } from '../contexts/briefs-context';
import Content from './content';
import Inputs from './inputs';
import { WidgetEditForm } from './widget-edit-form';
import { ContentTypes, InputTypes } from '../types/brief.types';

export default function Widgets() {
  // inputs of type Input: short text, paragraph, checkbox, select, dropdown, date, etc.
  const { content, inputs, isEditing, stopEditing } = useBriefsContext();
  const { t } = useTranslation('briefs');

  const mappedInputs = inputs.map((input) => {
    return {
      name: input.name,
      icon: input.icon,
      action: input.action,
      type: input.content.type as InputTypes,
    };
    // return input;
  });

  const mappedContent = content.map((content) => {
    return {
      name: content.name,
      icon: content.icon,
      action: content.action,
      type: content.content.type as ContentTypes,
    };
  });

  return (
    <div className="w-full h-full flex flex-col gap-4 max-h-full overflow-y-auto no-scrollbar">
      {isEditing ? (
        <>
        <div className='flex gap-2 items-center'>
        <Button onClick={stopEditing} className='hover:bg-slate-100 p-0 rounded-full w-11 h-11 flex items-center justify-center bg-transparent text-black shadow-none' variant={'ghost'}>

          <ArrowLeft className='w-6 h-6 text-black' />
        </Button>
          <h1 className="text-2xl font-bold">
            {t('creation.widgets.edit.title')}
          </h1>
        </div>
          <WidgetEditForm />
        </>
      ) : (
        <>
          <div className='flex flex-col gap-4 max-h-full overflow-y-auto no-scrollbar'>

            <Inputs inputs={mappedInputs} />
            <Content content={mappedContent} />
          </div>
        </>
      )}
    </div>
  );
}