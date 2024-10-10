import { useState } from 'react';

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

   // Swap two form fields
   const swapFormFields = (fromId: number, toId: number) => {
    const updatedFormFields = [...formFields];
    const [movedField] = updatedFormFields.splice(fromId, 1); // Remove the field from its original position
    if(movedField) {

      updatedFormFields.splice(toId, 0, movedField); // Insert it at the new position
      setFormFields(updatedFormFields);
    }
  };

  return {
    inputs,
    content,
    inputsMap,
    contentMap,
    formFields,
    currentFormField,
    isEditing,
    addFormField,
    removeFormField,
    updateFormField,
    duplicateFormField,
    editFormField,
    stopEditing,
    startEditing,
    swapFormFields
 
  };
};
