import * as React from 'react';

import { Plus } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import { Button } from '@kit/ui/button';

import { Progress } from '../../../../../../packages/ui/src/shadcn/progress';
import SubTask from './sub-task';
import { ThemedProgress } from 'node_modules/@kit/accounts/src/components/ui/progress-themed-with-settings';

function TaskDropdown() {
  const tasks = [
    {
      name: 'Kick-off del pedido',
      subtasks: [
        {
          name: 'Kick-off 1',
          state: 'in_progress',
          priority: 'high',
        },
        {
          name: 'Kick-off 2',
          state: 'pending',
          priority: 'medium',
        },
      ],
    },
    {
      name: 'Diseño del producto',
      subtasks: [
        {
          name: 'Diseño inicial',
          state: 'completed',
          priority: 'high',
        },
        {
          name: 'Revisión de diseño',
          state: 'in_review',
          priority: 'high',
        },
        {
          name: 'Ajustes finales',
          state: 'pending',
          priority: 'low',
        },
      ],
    },
    {
      name: 'Desarrollo del producto',
      subtasks: [
        {
          name: 'Configuración del entorno',
          state: 'completed',
          priority: 'high',
        },
        {
          name: 'Desarrollo del backend',
          state: 'in_progress',
          priority: 'high',
        },
        {
          name: 'Desarrollo del frontend',
          state: 'pending',
          priority: 'medium',
        },
        {
          name: 'Integración',
          state: 'pending',
          priority: 'low',
        },
      ],
    },
    {
      name: 'Pruebas del producto',
      subtasks: [
        {
          name: 'Pruebas unitarias',
          state: 'pending',
          priority: 'high',
        },
        {
          name: 'Pruebas de integración',
          state: 'pending',
          priority: 'medium',
        },
        {
          name: 'Pruebas de aceptación',
          state: 'pending',
          priority: 'high',
        },
      ],
    },
  ];

  return (
    <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
      <Accordion type="single" collapsible type="multiple" className="w-full">
        {tasks.map((task, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              <div className="w-full">
                <p className="mb-5 flex justify-start font-semibold text-gray-900">
                  {task.name}
                </p>
                <ThemedProgress value={60} className="w-full" />
              </div>
            </AccordionTrigger>
            <AccordionContent className='ml-3'>
              {task.subtasks.map((subtask, subIndex) => (
                <SubTask
                  key={subIndex}
                  name={subtask.name}
                  status={subtask.state}
                  priority={subtask.priority}
                />
              ))}
              <Button variant="secondary" className="mt-1 py-0 text-gray-600">
                <Plus className="mr-1 h-5 w-5" />
                <p className="text-sm">Añadir sub-tarea</p>
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
        <Button variant="secondary" className="mt-4 py-0 text-gray-600">
          <Plus className="mr-1 h-5 w-5" />
          <p className="text-sm">Añadir tarea</p>
        </Button>
      </Accordion>
    </div>
  );
}

export default TaskDropdown;
