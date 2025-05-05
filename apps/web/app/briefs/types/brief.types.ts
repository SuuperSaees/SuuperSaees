import { Dispatch, SetStateAction, type JSX } from 'react';

import { UseMutationResult } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { Brief as BriefType } from '~/lib/brief.types';
import { FormField as FormFieldType } from '~/lib/form-field.types';
import { Service } from '~/lib/services.types';

import { BriefCreationForm } from '../components/brief-creation-form';
import { briefCreationFormSchema } from '../schemas/brief-creation-schema';

type FormFieldType = FormFieldType.Insert;
type BriefType = BriefType.Type;

export type Option = {
  label: string;
  value: string;
  selected?: boolean;
};

export type FormField = Omit<FormFieldType, 'created_at' | 'id'> & {
  options?: Option[] | null;
  id: string;
};

export type InputToEdit = {
  name: keyof FormFieldType;
  isFocus: boolean;
};

export type Brief = Pick<BriefType, 'name'> & {
  id?: BriefType['id'];
  description?: BriefType['description'];
  image_url?: BriefType['image_url'];
  services: Pick<Service.Response, 'id' | 'name'>[];
};

export type ComponentProps = {
  index: number;
  question: FormField;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    id: string,
    field:
      | 'label'
      | 'description'
      | 'placeholder'
      | `options.${number}.selected`
      | 'image_url'
      | 'options',
    value: string | boolean | Date | Option[],
  ) => void;
  handleRemoveQuestion?: (id: string) => void;
  userRole?: string;
  inSidebar?: boolean;
  handleQuestionFocus?: (id: string, field: keyof FormFieldType) => void;
  handleQuestionBlur?: () => Promise<void>
  [key: string]: unknown;
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

export interface BriefsContext {
  brief: Brief;
  inputs: Input[];
  content: Content[];
  formFields: FormField[];
  inputsMap: Map<InputTypes, Input>;
  contentMap: Map<ContentTypes, Content>;
  isEditing: boolean;
  currentFormField: FormField | undefined;
  inputToEdit: InputToEdit | null;
  createDefaultFormFields: (formFields: FormFieldType.Response[]) => {
    defaultFormFields: FormField[];
    defaultInitialFormField: FormField | null;
  };
  setInputToEdit: Dispatch<SetStateAction<InputToEdit | null>>;
  updateBrief: (updatedBrief: Brief) => void;
  addFormField: (formFieldType: FormField['type']) => FormField;
  removeFormField: (id: string) => FormField[];
  updateFormField: (
    id: string,
    updatedFormField: FormField,
    focusedInput?: InputToEdit['name'],
  ) => void;
  duplicateFormField: (id: string) => FormField[];
  editFormField: (id: string, field?: InputToEdit['name']) => void;
  stopEditing: () => void;
  startEditing: () => void;
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  setBrief: Dispatch<SetStateAction<Brief>>;
  setCurrentFormField: Dispatch<SetStateAction<FormField | undefined>>;
  updateBriefFormFields: (
    values: z.infer<typeof briefCreationFormSchema>['questions'],
  ) => Promise<void>;
  onSubmit: (
    values: z.infer<typeof briefCreationFormSchema>,
    isUpdate?: boolean,
  ) => void;
  form: UseFormReturn<BriefCreationForm>;
  briefMutation: UseMutationResult<
    void,
    Error,
    { values: z.infer<typeof briefCreationFormSchema>; isUpdate?: boolean },
    unknown
  >;
  activeTab: 'widgets' | 'settings';
  setActiveTab: Dispatch<SetStateAction<'widgets' | 'settings'>>;
}
