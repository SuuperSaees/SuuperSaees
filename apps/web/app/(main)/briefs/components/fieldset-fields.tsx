import React, { useEffect, useMemo, useRef } from 'react';

import { GripHorizontal } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { useBriefsContext } from '../contexts/briefs-context';
import { ComponentProps, FormField } from '../types/brief.types';
import { isContentType, isInputType } from '../utils/type-guards';
import { BriefCreationForm } from './brief-creation-form';
import { Sortable } from './sortable';
import { deepEqual } from '~/utils/compare';

interface FieldsetFieldsProps {
  form: UseFormReturn<BriefCreationForm>;
  userRole: string;
}
export default function FieldsetFields({
  form,
  userRole,
}: FieldsetFieldsProps) {
  const {
    formFields,
    inputsMap,
    contentMap,
    updateFormField,
    removeFormField,
    editFormField,
    updateBriefFormFields
  } = useBriefsContext();

  const initialFormState =
    useRef<Partial<FormField>[]>(formFields);

  const renderNumber = useRef(1);

  // Handle changes to a specific question field
  const handleQuestionChange: ComponentProps['handleQuestionChange'] = (
    id,
    field,
    value,
  ) => {
    const index = formFields.findIndex((field) => field.id === id);
    // Update question in context if it exists

    if (formFields[index]) {
      updateFormField(formFields[index].id, {
        ...formFields[index],
        [field]: value,
      }); // Update context field
      const updatedQuestions = form.getValues('questions'); // Get current form questions

      // If the question exists in the form, update its value
      if (updatedQuestions[index]) {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value,
        };
        form.setValue('questions', updatedQuestions); // Update form state
      }
    }
  };

  const handleQuestionFocus: ComponentProps['handleQuestionFocus'] = (
    id,
    field,
  ) => {
    editFormField(id, field)
  };

  // Handle removing a question from the form
  const handleRemoveQuestion = (id: string) => {
    removeFormField(id); // Remove field from context
    const currentQuestions = form.getValues('questions'); // Get current questions
    // Filter out the question to be removed
    const newQuestions = currentQuestions.filter(
      (prevQuestion) => prevQuestion.id !== id,
    );
    form.setValue('questions', newQuestions); // Update form state with the new questions array
  };

  const handleQuestionBlur = async () => {
    const currentFormState = form.getValues('questions');

    // Use the custom deep equality check
    if (!deepEqual(initialFormState.current, currentFormState)) {
      // Update value if it's an option to be equal to label
      const updatedFormState = [...currentFormState];
      updatedFormState.forEach(question => {
        if (question.type === 'select' || question.type === 'multiple_choice') {
          question.options?.forEach(opt => {
            opt.value = opt.label;
          }); 
        }
      });
      
      await updateBriefFormFields(updatedFormState);
      initialFormState.current = formFields;
    }
  };
  const memoizedInputsMap = useMemo(() => inputsMap, []);
  const memoizedContentMap = useMemo(() => contentMap, []);

  useEffect(() => {
    if (formFields.length > 0 && renderNumber.current === 1) {
      renderNumber.current = renderNumber.current + 1;
      initialFormState.current = formFields;
    }
  }, [formFields]);
  
  return (
    <>
      {formFields.map((question, index) => {
        if (question.type) {
          const inputEntry = isInputType(question.type)
            ? memoizedInputsMap.get(question.type)
            : isContentType(question.type)
              ? memoizedContentMap.get(question.type)
              : undefined;
          const FormFieldComponent = inputEntry?.component;
          if (!FormFieldComponent) {
            return null; // If no component found, skip rendering
          }
          // Check if FormFieldComponent is a function
          if (typeof FormFieldComponent === 'function') {
            return (
              <Sortable
                key={'q' + question.id}
                id={question.id}
                className="group relative cursor-grab rounded-md px-6 py-6 hover:bg-[#f2f2f2]"
              >
                <GripHorizontal className="absolute right-1/2 top-2 hidden h-4 w-4 group-hover:block" />
                <FormFieldComponent
                  index={index}
                  question={question}
                  form={form}
                  handleQuestionChange={
                    question.type === 'rich-text'
                      ? (value: string) => {
                          handleQuestionChange(question.id, 'label', value);
                        }
                      : handleQuestionChange
                  }
                  handleRemoveQuestion={handleRemoveQuestion}
                  handleQuestionFocus={handleQuestionFocus}
                  handleQuestionBlur={handleQuestionBlur}
                  userRole={userRole}
                />
              </Sortable>
            );
          }
          // If it's a JSX element, render it directly
          return <div key={'q' + index}>{FormFieldComponent}</div>;
        }
        return null;
      })}
    </>
  );
}
