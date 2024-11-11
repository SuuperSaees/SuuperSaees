'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BriefCreationForm } from '../components/brief-creation-form';
import Options from '../components/form-field-actions';
import InputCard from '../components/input-card';
import { useBrief } from '../hooks/use-brief';
import { useBriefDragAndDrop } from '../hooks/use-brief-drag-and-drop';
import { useBriefFormFields } from '../hooks/use-brief-form-fields';
import { briefCreationFormSchema } from '../schemas/brief-creation-schema';
import {
  Brief,
  Content,
  ContentTypes,
  FormField,
  Input,
  InputTypes,
} from '../types/brief.types';
import { isContentType, isInputType } from '../utils/type-guards';
import { FormField as FormFieldServer } from '~/lib/form-field.types';
interface BriefsContext {
  brief: Brief;
  inputs: Input[];
  content: Content[];
  formFields: FormField[];
  inputsMap: Map<InputTypes, Input>;
  contentMap: Map<ContentTypes, Content>;
  isEditing: boolean;
  currentFormField: FormField | undefined;
  createDefaultFormFields: (formFields: FormFieldServer.Response[]) => { defaultFormFields: FormField[]; defaultInitialFormField: FormField | null };
  updateBrief: (updatedBrief: Brief) => void;
  addFormField: (formFieldType: FormField['type']) => FormField;
  removeFormField: (id: string) => void;
  updateFormField: (id: string, updatedFormField: FormField) => void;
  duplicateFormField: (id: string) => void;
  editFormField: (id: string) => void;
  stopEditing: () => void;
  startEditing: () => void;
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  setBrief: Dispatch<SetStateAction<Brief>>;
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

export const BriefsContext = createContext<BriefsContext | undefined>(
  undefined,
);

export const BriefsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'settings'>('widgets');
  const { t } = useTranslation('briefs');
  const formFieldsContext = useBriefFormFields(setActiveTab);
  const sortedFormFields = formFieldsContext.formFields.sort((a, b) => a.position - b.position);
  const briefContext = useBrief(formFieldsContext.setFormFields);

  const { isDragging, widget, handleDragStart, handleDragEnd, sensors } =
    useBriefDragAndDrop({
      swapFormFields: formFieldsContext.swapFormFields,
      formFields: formFieldsContext.formFields,
      addFormField: formFieldsContext.addFormField,
    });

  // Initialize the form with Zod schema for validation and set default values
  const form = useForm<BriefCreationForm>({
    resolver: zodResolver(briefCreationFormSchema), // Resolver for Zod validation
    defaultValues: {
      name: '', // Default name field,
      description: '',
      image_url: '',
      questions: formFieldsContext.formFields, // Initialize questions with values from context,
      default_question: {
        label: t('creation.form.defaultField.label'), // not editable
        description: '', // editable
        placeholder: t('creation.form.defaultField.placeholder'), // editable
        type: 'text-short', // not editable,
        required: true,
        position: 0,
        id: 'create-form-field-' + 0,
      },
    },
  });

  // Form submission handler
  const onSubmit = (
    values: z.infer<typeof briefCreationFormSchema>,
    isUpdate?: boolean,
  ) => {
    // join default question with values (questions)
    const newQuestionValues = [...values.questions, values.default_question];

    const newValues = {
      ...values,
      questions: newQuestionValues,
    };

    briefContext.briefMutation.mutate({ values: newValues, isUpdate });

    // Trigger the mutation with form values
    setActiveTab('settings');
  };

  const WidgetComponent = useCallback(() => {
    const widgetType = widget.type ?? '';

    const getWidgetEntry = (widgetType: string) => {
      if (isInputType(widgetType)) {
        return formFieldsContext.inputsMap.get(widgetType);
      } else if (isContentType(widgetType)) {
        return formFieldsContext.contentMap.get(widgetType);
      }
      return undefined;
    };

    const widgetEntry = getWidgetEntry(widgetType);

    if (!widgetEntry) return null;

    return (
      <div className="relative">
        <InputCard
          name={widgetEntry?.name}
          icon={widgetEntry?.icon}
          action={widgetEntry?.action}
          className="cursor-move border-none bg-white/70 text-gray-600 hover:border-gray-300"
        />
        <Plus className="absolute right-2 top-2 h-5 w-5 text-gray-500" />
      </div>
    );
  }, [widget.type, formFieldsContext.inputsMap, formFieldsContext.contentMap]);
  
  return (
    <BriefsContext.Provider
      value={{
        ...formFieldsContext,
        formFields: sortedFormFields,
        ...briefContext,
        form,
        onSubmit,
        activeTab,
        setActiveTab,
      }}
    >
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
        collisionDetection={closestCorners}
      >
        <SortableContext items={formFieldsContext.formFields}>
          {children}
          {isDragging && widget.isDragging ? (
            <DragOverlay>
              <WidgetComponent />
            </DragOverlay>
          ) : null}
        </SortableContext>
      </DndContext>
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
