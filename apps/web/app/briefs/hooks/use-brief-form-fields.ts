import { Dispatch, SetStateAction, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';

import { generateContent } from '../configs/content';
import { generateInputs } from '../configs/inputs';
import {
  ContentTypes,
  FormField,
  Input,
  InputTypes,
} from '../types/brief.types';
import { isContentType, isInputType } from '../utils/type-guards';

// Centralized FormField State Management Hook
export const useBriefFormFields = (setActiveTab: Dispatch<SetStateAction<'widgets' | 'settings'>>) => {
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
        id: nextIndexId,
        type: formFieldType,
        label: '',
        placeholder: '',
        description: '',
        position: nextIndexId,
      };
    } else {
      newFormField = {
        ...newFormField,
        id: nextIndexId,
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
    setActiveTab('widgets')

    return newFormField;
  };

  // Remove a form field by id
  const removeFormField = (id: number) => {
    setFormFields((prevFields) => {
      const updatedFormFields = prevFields.filter((field) => field.id !== id);
      return updateFieldPositions(updatedFormFields);
    });
    setCurrentFormField(undefined);
    stopEditing();
  };

  // Update a form field
  const updateFormField = (id: number, updatedFormField: FormField) => {
    setFormFields((prevFields) => {
      const index = prevFields.findIndex((field) => field.id === id);
      if (index !== -1) {
        const updatedFormFields = [...prevFields];
        updatedFormFields[index] = updatedFormField;
        return updateFieldPositions(updatedFormFields);
      }
      return prevFields;
    });
  };

  // Swap two form fields and update their positions
  const swapFormFields = (fromIndex: number, toIndex: number) => {
    setFormFields((prevFields) => {
      const reorderedFields = arrayMove(prevFields, fromIndex, toIndex);
      return updateFieldPositions(reorderedFields);
    });
  };

  // Stop editing
  const stopEditing = () => setIsEditing(false);

  // Start editing
  const startEditing = () => setIsEditing(true);

  // Edit form field
  const editFormField = (id: number) => {
    const index = formFields.findIndex(formField => formField.id === id);
    setCurrentFormField(formFields[index]);
    startEditing();
    setActiveTab('widgets')
  };

  // Duplicate form field
  const duplicateFormField = (id: number) => {
    const index = formFields.findIndex(formField => formField.id === id);
    const formField = formFields[index];
    if (!formField) return;

    const duplicatedFormField = {
      ...formField,
      id: formFields.length + 1,
    };

    setFormFields((prevFields) =>
      updateFieldPositions([...prevFields, duplicatedFormField]),
    );
    setActiveTab('widgets')
  };

  return {
    inputs,
    content,
    inputsMap,
    contentMap,
    formFields,
    currentFormField,
    isEditing,
    setFormFields,
    addFormField,
    removeFormField,
    updateFormField,
    duplicateFormField,
    editFormField,
    stopEditing,
    startEditing,
    swapFormFields,
  };
};
