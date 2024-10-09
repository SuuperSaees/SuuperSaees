'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';

import { useBriefsContext } from '../contexts/briefs-context';
import Content from './content';
import Inputs from './inputs';
import { WidgetEditForm } from './widget-edit-form';


export default function Widgets() {
  // inputs of type Input: short text, paragraph, checkbox, select, dropdown, date, etc.
  const { content, inputs, isEditing, stopEditing } = useBriefsContext();
  const { t } = useTranslation('briefs');

  return (
    <div className="flex w-full max-w-80 flex-col gap-4 p-4 border border-l-1 border-slate-gray-300 max-h-full h-full overflow-y-auto">
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
          <h1 className="text-2xl font-bold">Widgets</h1>
          <Inputs inputs={inputs} />
          <Content content={content} />
        </>
      )}
    </div>
  );
}