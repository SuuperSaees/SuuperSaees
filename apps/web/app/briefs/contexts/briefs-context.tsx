'use client';

import { createContext, useContext, useState } from 'react';

import { UseFormReturn } from 'react-hook-form';

import { Brief } from '~/lib/brief.types';

import { BriefCreationForm } from '../components/brief-creation-form';
import { generateContent } from '../configs/content';
import { generateInputs } from '../configs/inputs';
import { isContentType, isInputType } from '../utils/type-guards';

export type Option = {
  label: string;
  value: string;
  selected?: boolean;
};

export type FormField = Omit<
  Brief.Relationships.FormField,
  'created_at' | 'id'
> & {
  options?: Option[];
};

export type ComponentProps = {
  index: number;
  question: FormField;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'label' | 'description' | 'placeholder' | `options.${number}.selected`,
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

interface BriefsContext {
  inputs: Input[];
  content: Content[];
  formFields: FormField[];
  inputsMap: Map<InputTypes, Input>;
  contentMap: Map<ContentTypes, Content>;
  addFormField: (formFieldType: FormField['type']) => FormField;
  removeFormField: (index: number) => void;
  updateFormField: (index: number, updatedFormField: FormField) => FormField;
}

export const BriefsContext = createContext<BriefsContext | undefined>(
  undefined,
);

export const BriefsProvider = ({ children }: { children: React.ReactNode }) => {
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const inputsMap = generateInputs((inputName: InputTypes) => {
    addFormField(inputName);
  });

  // inputs of type Input: short text, paragraph, checkbox, select, dropdown, date, etc.
  const inputs: Input[] = Array.from(inputsMap.values());

  const contentMap = generateContent((contentName: ContentTypes) => {
    addFormField(contentName);
  });

  // title, enriched text, image, video
  const content = Array.from(contentMap.values());

  // Add a new form field
  const addFormField = (formFieldType: FormField['type']) => {
    let newFormField: FormField | undefined;

    if (formFieldType && isInputType(formFieldType)) {
      newFormField = inputsMap.get(formFieldType)?.content;
    } else if (formFieldType && isContentType(formFieldType)) {
      newFormField = contentMap.get(formFieldType)?.content;
    }

    if (newFormField) {
      setFormFields([...formFields, newFormField]);
    }

    return (
      newFormField ?? {
        type: formFieldType,
        label: '',
        placeholder: '',
        description: '',
      }
    );
  };

  // Remove a form field
  const removeFormField = (index: number) => {
    const updatedFormFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFormFields);
  };

  // Update a form field
  const updateFormField = (index: number, updatedFormField: FormField) => {
    const updatedFormFields = [...formFields];
    updatedFormFields[index] = updatedFormField;
    setFormFields(updatedFormFields);
    return updatedFormField;
  };

  const value = {
    inputs,
    content,
    formFields,
    inputsMap,
    contentMap,
    addFormField,
    removeFormField,
    updateFormField,
  };

  return (
    <BriefsContext.Provider value={value}>{children}</BriefsContext.Provider>
  );
};

export const useBriefsContext = () => {
  const context = useContext(BriefsContext);
  if (!context) {
    throw new Error('useBriefsContext must be used within a BriefsProvider');
  }
  return context;
};
