import * as React from 'react';

import { Plus } from 'lucide-react';
import { ThemedProgress } from 'node_modules/@kit/accounts/src/components/ui/progress-themed-with-settings';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import { Button } from '@kit/ui/button';

import { Task } from '~/lib/tasks.types';

// import { Progress } from '../../../../../../packages/ui/src/shadcn/progress';
import SubTask from './sub-task';
import { calculateSubtaskProgress } from '~/utils/task-counter';

function TaskDropdown({ tasks }: { tasks: Task.Type[] }) {
  return (
    <div className="no-scrollbar max-h-[70vh] overflow-y-auto">
      <Accordion type="single" collapsible type="multiple" className="w-full">
        {tasks.map((task, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              <div className="w-full">
                <p className="mb-5 flex justify-start font-semibold text-gray-900">
                  {task.name}
                </p>
                <ThemedProgress value={calculateSubtaskProgress(task.subtasks ?? [])} className="w-full" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="ml-3">
              {task?.subtasks?.map((subtask, subIndex) => (
                <SubTask
                  key={subIndex}
                  name={subtask.name ?? ''}
                  status={subtask.state ?? 'pending'}
                  priority={subtask.priority ?? 'low'}
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
