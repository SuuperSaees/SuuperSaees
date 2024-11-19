import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';

import { FormField as ServerFormField } from '~/lib/form-field.types';

import { useGenerateContent } from '../configs/content';
import { useGenerateInputs } from '../configs/inputs';
import {
  ContentTypes,
  FormField,
  Input,
  InputToEdit,
  InputTypes,
  Option,
} from '../types/brief.types';
import { isContentType, isInputType } from '../utils/type-guards';

// Centralized FormField State Management Hook
export const useBriefFormFields = (
  setActiveTab: Dispatch<SetStateAction<'widgets' | 'settings'>>,
) => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [inputToEdit, setInputToEdit] = useState<InputToEdit | null>(null);
  const [currentFormField, setCurrentFormField] = useState<
    FormField | undefined
  >(undefined);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const inputsMap = useGenerateInputs((inputName: InputTypes) => {
    addFormField(inputName);
  });

  // inputs of type Input: short text, paragraph, checkbox, select, dropdown, date, etc.
  const inputs: Input[] = Array.from(inputsMap.values());

  const contentMap = useGenerateContent((contentName: ContentTypes) => {
    addFormField(contentName);
  });

  // title, enriched text, image, video
  const content = Array.from(contentMap.values());

  // Helper to create default form fields
  const createDefaultFormFields = useCallback(
    (
      formFields: ServerFormField.Response[],
    ): {
      defaultFormFields: FormField[];
      defaultInitialFormField: FormField | null;
    } => {
      let defaultInitialFormField: FormField | null = null;

      // Process form fields
      const defaultFormFields = formFields
        .map((field) => {
          const newField: FormField = {
            ...field,
            options: isValidOptions(field.options) ? field.options : null, // Ensure options are valid
          };

          // Check if the field is the default initial one (position 0)
          if (field.position === 0) {
            defaultInitialFormField = newField; // Assign the default initial field
            defaultInitialFormField.position = 0;
            return null; // Exclude from the defaultFormFields array
          }

          return newField;
        })
        .filter((field) => field !== null); // Filter out null values

      return {
        defaultFormFields,
        defaultInitialFormField,
      };
    },
    [],
  );

  // Helper to update field positions consistently
  function updateFieldPositions(fields: FormField[]): FormField[] {
    return fields.map((field, index) => ({
      ...field,
      position: index + 1, // Set position to index + 1 (1-based indexing)
    }));
  }

  // Create a new form field
  function createFormField(formFieldType: FormField['type']): FormField {
    let newFormField: FormField | undefined;

    if (formFieldType && isInputType(formFieldType)) {
      newFormField = inputsMap.get(formFieldType)?.content;
    } else if (formFieldType && isContentType(formFieldType)) {
      newFormField = contentMap.get(formFieldType)?.content;
    }

    const nextIndexId = formFields.length + 1;

    // Ensure newFormField is defined or create a default object
    if (!newFormField) {
      newFormField = {
        id: 'create-form-field-' + nextIndexId,
        type: formFieldType,
        label: '',
        placeholder: '',
        description: '',
        position: nextIndexId,
      };
    } else {
      newFormField = {
        ...newFormField,
        id: 'create-form-field-' + nextIndexId,
        position: nextIndexId,
      };
    }

    return newFormField;
  }

  // Add a new form field
  const addFormField = (
    formFieldType: FormField['type'],
    insertAtIndex?: number,
  ): FormField => {
    const newFormField = createFormField(formFieldType);

    setFormFields((prevFields) => {
      const updatedFields = [...prevFields];

      if (typeof insertAtIndex === 'number') {
        updatedFields.splice(insertAtIndex, 0, newFormField);
      } else {
        updatedFields.push(newFormField);
      }

      return updateFieldPositions(updatedFields);
    });

    setCurrentFormField(newFormField);
    setIsEditing(true);
    setActiveTab('widgets');

    return newFormField;
  };

  // Remove a form field by id
  const removeFormField = (id: string) => {
    let newFormFields: FormField[] = []; 

    setFormFields((prevFields) => {
      const updatedFormFields = prevFields.filter((field) => field.id !== id);
      newFormFields = updateFieldPositions(updatedFormFields);
      return newFormFields
    });

    setCurrentFormField(undefined);
    stopEditing();
    return newFormFields;
  };

  // Update a form field
  const updateFormField = (
    id: string,
    updatedFormField: FormField,
    focusedInput?: InputToEdit['name'],
  ) => {
    setFormFields((prevFields) => {
      const index = prevFields.findIndex((field) => field.id === id);
      if (index !== -1) {
        const updatedFormFields = [...prevFields];
        updatedFormFields[index] = updatedFormField;
        return updateFieldPositions(updatedFormFields);
      }
      return prevFields;
    });

    setCurrentFormField(updatedFormField);
    if (focusedInput) {
      setInputToEdit({ name: focusedInput, isFocus: true });
    }
  };

  // Swap two form fields and update their positions
  const swapFormFields = (fromIndex: number, toIndex: number) => {
    let newFormFields: FormField[] = []; 
    
    setFormFields((prevFields) => {
      const reorderedFields = arrayMove(prevFields, fromIndex, toIndex);
      newFormFields = updateFieldPositions(reorderedFields);
      return newFormFields
    });
    return newFormFields
  };

  // Stop editing
  const stopEditing = () => setIsEditing(false);

  // Start editing
  const startEditing = () => setIsEditing(true);

  // Edit form field
  const editFormField = (id: string, field?: InputToEdit['name']) => {
    const index = formFields.findIndex((formField) => formField.id === id);
    setCurrentFormField(formFields[index]);
    startEditing();
    setActiveTab('widgets');
    field && setInputToEdit({ name: field, isFocus: true });
  };

  // Duplicate form field
  const duplicateFormField = (id: string) => {
    let newFormFields: FormField[] = []; 
    const index = formFields.findIndex((formField) => formField.id === id);
    const formField = formFields[index];
    if (!formField) return [];

    const duplicatedFormField: FormField = {
      ...formField,
      id: 'create-form-field-' + (formFields.length + 1),
    };

    setFormFields((prevFields) => {
      // Create a copy of the form fields and insert the duplicate immediately after the original
      const updatedFields = [...prevFields];
      updatedFields.splice(index + 1, 0, duplicatedFormField);
      newFormFields = updateFieldPositions(updatedFields);
      // Update positions after inserting the duplicated form field
      return newFormFields
    });

    setActiveTab('widgets');
    return newFormFields
  };

  return {
    inputs,
    content,
    inputsMap,
    contentMap,
    formFields,
    currentFormField,
    isEditing,
    inputToEdit,
    setInputToEdit,
    setFormFields,
    createDefaultFormFields,
    addFormField,
    removeFormField,
    updateFormField,
    duplicateFormField,
    editFormField,
    stopEditing,
    startEditing,
    swapFormFields,
    setCurrentFormField
  };
};

// Guard to ensure the options property inside form fields follow the correct format ({ label: string, value: string, selected?: string }[])
function isValidOptions(options: unknown): options is Option[] {
  if (!Array.isArray(options)) return false;
  return options.every(
    (option) =>
      option !== null &&
      typeof option.label === 'string' &&
      typeof option.value === 'string',
  );
}
