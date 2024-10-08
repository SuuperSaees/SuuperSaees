'use client';

import { useBriefsContext } from '../contexts/briefs-context';
import Content from './content';
import Inputs from './inputs';

export default function Widgets() {
  // inputs of type Input: short text, paragraph, checkbox, select, dropdown, date, etc.
  const { content, inputs } = useBriefsContext();

  return (
    <div className="flex w-full max-w-80 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Widgets</h1>
      <Inputs inputs={inputs} />
      <Content content={content} />
    </div>
  );
}
