import { useState } from 'react';

import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { FormField } from '../types/brief.types';

export function useBriefDragAndDrop({
  swapFormFields,
  formFields,
  addFormField,
  updateFn
}: {
  swapFormFields: (fromIndex: number, toIndex: number) => FormField[];
  formFields: FormField[];
  addFormField: (
    formFieldType: FormField['type'],
    insertAtIndex?: number,
  ) => FormField;
  updateFn: (values: FormField[]) => Promise<void>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [widget, setWidget] = useState({
    isDragging: false,
    type: null,
  });

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
  function handleDragStart(event: DragStartEvent) {
    setIsDragging(true);
    const draggableData = event.active?.data?.current;

    if (draggableData?.type) {
      setWidget({
        isDragging: true,
        type: draggableData.type,
      });
    } else {
      setWidget({
        isDragging: false,
        type: null,
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Find indexes in formFields
    const oldIndex = formFields.findIndex((field) => field.id === active.id);
    const newIndex = formFields.findIndex((field) => field.id === over?.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Use the swapFormFields method to reorder the fields
      const newFormFields = swapFormFields(oldIndex, newIndex);
      await updateFn(newFormFields);
      
    } else {
      // Different container (e.g., dragging from widget list)
      const draggedItemData = active.data.current;
      const formFieldType = draggedItemData?.type;

      if (formFieldType) {
        // Add the new form field at the `newIndex` position and update positions
        addFormField(formFieldType, newIndex ?? 0);
      }
    }

    setIsDragging(false);
  }
  return {
    isDragging,
    widget,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
}
