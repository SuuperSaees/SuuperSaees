'use client';

import { createContext, useContext, useState } from 'react';

import { Copy, Edit, Trash } from 'lucide-react';
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
  id: number;
  options?: Option[];
};

export type ComponentProps = {
  index: number;
  question: FormField;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'label' | 'description' | 'placeholder',
    value: string,
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
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const [currentFormField, setCurrentFormField] = useState<
    FormField | undefined
  >(undefined);

  const [isEditing, setIsEditing] = useState<boolean>(false);

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

  // Add a new form field using index as id (number)
  const addFormField = (formFieldType: FormField['type']) => {
    let newFormField: FormField | undefined;

    if (formFieldType && isInputType(formFieldType)) {
      newFormField = inputsMap.get(formFieldType)?.content;
    } else if (formFieldType && isContentType(formFieldType)) {
      newFormField = contentMap.get(formFieldType)?.content;
    }

    const nextIndexId = formFields.length; // Use the current length as the number-based id

    if (newFormField) {
      newFormField = {
        ...newFormField,
        id: nextIndexId, // Assign index as a number ID
      };
      setFormFields([...formFields, newFormField]);
    }

    setCurrentFormField(newFormField);
    setIsEditing(true);

    return (
      newFormField ?? {
        id: nextIndexId, // Ensure even empty form fields have a number id
        type: formFieldType,
        label: '',
        placeholder: '',
        description: '',
      }
    );
  };

  // Remove a form field by number id
  const removeFormField = (id: number) => {
    const updatedFormFields = formFields.filter((_, i) => i !== id);
    setFormFields(updatedFormFields);
  };

  // Update a form field by number id
  const updateFormField = (id: number, updatedFormField: FormField) => {
    if (id >= 0 && id < formFields.length) {
      const updatedFormFields = [...formFields];
      updatedFormFields[id] = updatedFormField;
      setFormFields(updatedFormFields);
      return updatedFormField;
    }
  };

  // Stop editing
  const stopEditing = () => {
    setIsEditing(false);
  };

  // Start editing
  const startEditing = () => {
    setIsEditing(true);
  };

  // Edit form field
  const editFormField = (id: number) => {
    setCurrentFormField(formFields[id]);
    startEditing();
  };

  // Duplicate form field
  const duplicateFormField = (id: number) => {
    const formField = formFields[id];
    if (!formField) return;

    // Clone the selected form field
    const duplicatedFormField = {
      ...formField,
      id: formFields.length, // Assign a new unique id based on the current length
    };

    // Add the duplicated form field to the formFields array
    setFormFields([...formFields, duplicatedFormField]);
  };

  const value = {
    inputs,
    content,
    formFields,
    inputsMap,
    contentMap,
    isEditing,
    currentFormField,
    addFormField,
    removeFormField,
    updateFormField,
    editFormField,
    duplicateFormField,
    stopEditing,
    startEditing,
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

const Options = ({
  formFieldId,
  className,
  ...rest
}: {
  formFieldId: number;
  className?: string;
  [key: string]: unknown;
}) => {
  const { duplicateFormField, removeFormField, editFormField } =
    useBriefsContext();

  const editItem = () => {
    editFormField(formFieldId);
    // You can add any additional logic here related to editing
  };

  const duplicateItem = () => {
    duplicateFormField(formFieldId);
  };

  const removeItem = () => {
    removeFormField(formFieldId);
  };

  const options = new Map([
    [
      'duplicate',
      {
        label: 'Duplicate',
        action: duplicateItem,
        icon: <Copy className="h-5 w-5" />,
      },
    ],
    [
      'edit',
      {
        label: 'Edit',
        action: editItem,
        icon: <Edit className="h-5 w-5" />,
      },
    ],
    [
      'remove',
      {
        label: 'Remove',
        action: removeItem,
        icon: <Trash className="h-5 w-5" />,
      },
    ],
  ]);

  return (
    <div className={`flex gap-2 ${className}`} {...rest}>
      {Array.from(options.values()).map((option, index) => (
        <button
          key={index}
          onClick={option.action}
          className="text-gray-600 hover:text-gray-800"
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};

BriefsProvider.Options = Options;