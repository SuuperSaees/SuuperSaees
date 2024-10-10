import { UseFormReturn } from 'react-hook-form';

import { Brief } from '~/lib/brief.types';

import { BriefCreationForm } from '../components/brief-creation-form';

export type Option = {
  label: string;
  value: string;
  selected?: boolean;
};

export type FormField = Omit<
  Brief.Relationships.FormField,
  'created_at' | 'id'
> & {
  id: number;
  options?: Option[];
};

export type ComponentProps = {
  index: number;
  question: FormField;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field:
      | 'label'
      | 'description'
      | 'placeholder'
      | `options.${number}.selected`,
    value: string | boolean | Date,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
};

export type InputTypes =
  | 'date'
  | 'text-short'
  | 'text-large'
  | 'select'
  | 'multiple_choice'
  | 'dropdown'
  | 'file';

export type Input = {
  name: string;
  icon: JSX.Element;
  action: () => void;
  content: FormField & {
    type?: InputTypes;
  };
  component: JSX.Element | ((props: ComponentProps) => JSX.Element); // Using a generic for props
};

export type ContentTypes =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'rich-text'
  | 'image'
  | 'video';

export type Content = {
  name: string;
  icon: JSX.Element;
  action: () => void;
  content: FormField & {
    type?: ContentTypes;
  };
  component: JSX.Element | ((props: ComponentProps) => JSX.Element); // Using a generic for props
};
