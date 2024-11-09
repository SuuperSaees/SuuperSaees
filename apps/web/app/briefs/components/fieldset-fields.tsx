import { GripHorizontal } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { useBriefsContext } from '../contexts/briefs-context';
import { isContentType, isInputType } from '../utils/type-guards';
import { BriefCreationForm } from './brief-creation-form';
import { Sortable } from './sortable';

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
  } = useBriefsContext();

  // Handle changes to a specific question field
  const handleQuestionChange = (
    id: number,
    field:
      | 'label'
      | 'description'
      | 'placeholder'
      | `options.${number}.selected`,
    value: string | boolean | Date,
  ) => {
    const index = formFields.findIndex((field) => field.id === id);
    // Update question in context if it exists
    if (formFields[index]) {
      updateFormField(index, { ...formFields[index], [field]: value }); // Update context field
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

  // Handle removing a question from the form
  const handleRemoveQuestion = (index: number) => {
    removeFormField(index); // Remove field from context
    const currentQuestions = form.getValues('questions'); // Get current questions
    // Filter out the question to be removed
    const newQuestions = currentQuestions.filter((_, i) => i !== index);
    form.setValue('questions', newQuestions); // Update form state with the new questions array
  };

  return (
    <>
      {formFields.map((question, index) => {
        if (question.type) {
          const inputEntry = isInputType(question.type)
            ? inputsMap.get(question.type)
            : isContentType(question.type)
              ? contentMap.get(question.type)
              : undefined;
          const FormFieldComponent = inputEntry?.component;
          if (!FormFieldComponent) {
            return null; // If no component found, skip rendering
          }
          // Check if FormFieldComponent is a function
          if (typeof FormFieldComponent === 'function') {
            return (
              <Sortable
                key={'q' + index}
                id={question.id}
                className="group relative cursor-grab rounded-md hover:bg-[#f2f2f2] px-6 py-6"
              >
                  <GripHorizontal className="absolute right-1/2 top-2 hidden h-4 w-4 group-hover:block" />
                  <FormFieldComponent
                    index={index}
                    question={question}
                    form={form}
                    handleQuestionChange={handleQuestionChange}
                    handleRemoveQuestion={handleRemoveQuestion}
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
