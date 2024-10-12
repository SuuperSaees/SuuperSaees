import { useState } from 'react';

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
export const useBriefFormFields = () => {
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
  const addFormField = (
    formFieldType: FormField['type'],
    insertAtIndex?: number, // Optional parameter to insert at a specific index
  ): FormField => {
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

    setFormFields((prevFields) => {
      const updatedFields = [...prevFields];

      if (typeof insertAtIndex === 'number') {
        // Insert the new field at the specific index
        updatedFields.splice(insertAtIndex, 0, newFormField);
      } else {
        // Append at the end if no specific index
        updatedFields.push(newFormField);
      }

      // Update positions based on the new array order
      const fieldsWithUpdatedPositions = updatedFields.map((field, index) => ({
        ...field,
        position: index + 1, // Set position to index + 1 (1-based indexing)
      }));

      return fieldsWithUpdatedPositions;
    });

    setCurrentFormField(newFormField);
    setIsEditing(true);

    return newFormField;
  };

  // Remove a form field by number id
  const removeFormField = (id: number) => {
    const updatedFormFields = formFields.filter((_, i) => i !== id);
    setFormFields(updatedFormFields);
    setCurrentFormField(undefined);
    stopEditing();
  };

  // Update a form field by number id
  const updateFormField = (id: number, updatedFormField: FormField) => {
    // Find the index of the form field with the given id
    const index = formFields.findIndex((field) => field.id === id);

    if (index !== -1) {
      const updatedFormFields = [...formFields];
      updatedFormFields[index] = updatedFormField;

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

  // Swap two form fields and update their positions
  const swapFormFields = (fromIndex: number, toIndex: number) => {
    setFormFields((prevFields) => {
      // Use arrayMove to reorder the formFields array
      const reorderedFields = arrayMove(prevFields, fromIndex, toIndex);

      // Update positions based on the new array order
      const fieldsWithUpdatedPositions = reorderedFields.map(
        (field, index) => ({
          ...field,
          position: index + 1, // Set position to index + 1 (1-based indexing)
        }),
      );

      return fieldsWithUpdatedPositions;
    });
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
