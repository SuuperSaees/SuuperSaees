'use client';

import { createContext, useCallback, useContext } from 'react';

import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import Options from '../components/form-field-actions';
import InputCard from '../components/input-card';
import { useBriefDragAndDrop } from '../hooks/use-brief-drag-and-drop';
import { useBriefFormFields } from '../hooks/use-brief-form-fields';
import {
  Content,
  ContentTypes,
  FormField,
  Input,
  InputTypes,
} from '../types/brief.types';
import { isContentType, isInputType } from '../utils/type-guards';

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
  ) => void;
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

  const { isDragging, widget, handleDragStart, handleDragEnd, sensors } =
    useBriefDragAndDrop({
      swapFormFields: formFieldsContext.swapFormFields,
      formFields: formFieldsContext.formFields,
      addFormField: formFieldsContext.addFormField,
    });

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

    const widgetEntry = getWidgetEntry(widgetType)

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
    <BriefsContext.Provider value={{ ...formFieldsContext }}>
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
