'use client';

import { createContext, useContext, useState } from 'react';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

import Options from '../components/form-field-actions';
import InputCard from '../components/input-card';
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

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const [isDropped, setIsDropped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function handleDragEnd(event: DragEndEvent) {
    if (event.over?.data?.current && event.active?.data?.current) {
      const droppableId =
        'droppable-form-field-' + event.over?.data?.current.id;
      if (event.over.id === droppableId) {
        console.log('droppable-data', event.over, event.active);
        setIsDropped(true);
        setIsDragging(false);
        formFieldsContext.swapFormFields(
          event.over.data.current.id,
          event.active.data.current.id,
        );
      }
    }
  }
  function handleDragStart() {
    setIsDragging(true);
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <BriefsContext.Provider value={{ ...formFieldsContext }}>
        {children}

        <DragOverlay className="border-gray-300 text-gray-300 grayscale-0 hover:border-gray-300">
          {isDragging ? (
            <InputCard
              icon={formFieldsContext?.inputs[0]?.icon}
              name={formFieldsContext?.inputs[0]?.name}
              action={() => {}}
            />
          ) : null}
        </DragOverlay>
      </BriefsContext.Provider>
    </DndContext>
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