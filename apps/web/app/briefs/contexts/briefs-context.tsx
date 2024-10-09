'use client';

import { createContext, useContext } from 'react';

import Options from '../components/form-field-actions';
import { useBriefFormFields } from '../hooks/use-brief-form-fields';
import {
  Content,
  ContentTypes,
  FormField,
  Input,
  InputTypes,
} from '../types/brief.types';

interface BriefsContext {
  inputs: Input[];
  content: Content[];
  formFields: FormField[];
  inputsMap: Map<InputTypes, Input>;
  contentMap: Map<ContentTypes, Content>;
  isEditing: boolean;
  currentFormField: FormField | undefined;
  addFormField: (formFieldType: FormField['type']) => FormField;
  removeFormField: (index: number) => void;
  updateFormField: (
    index: number,
    updatedFormField: FormField,
  ) => FormField | undefined;
  duplicateFormField: (id: number) => void;
  editFormField: (id: number) => void;
  stopEditing: () => void;
  startEditing: () => void;
}

export const BriefsContext = createContext<BriefsContext | undefined>(
  undefined,
);

export const BriefsProvider = ({ children }: { children: React.ReactNode }) => {
  const formFieldsContext = useBriefFormFields();

  return (
    <BriefsContext.Provider value={{ ...formFieldsContext }}>
      {children}
    </BriefsContext.Provider>
  );
};

export const useBriefsContext = () => {
  const context = useContext(BriefsContext);
  if (!context) {
    throw new Error('useBriefsContext must be used within a BriefsProvider');
  }
  return context;
};

BriefsProvider.Options = Options;