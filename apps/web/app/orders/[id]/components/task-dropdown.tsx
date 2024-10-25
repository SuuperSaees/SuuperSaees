import * as React from 'react';
import { useState } from 'react';
import { Pen, Plus, TrashIcon, X } from 'lucide-react';
import { ThemedProgress } from 'node_modules/@kit/accounts/src/components/ui/progress-themed-with-settings';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import { Button } from '@kit/ui/button';

import { Task } from '~/lib/tasks.types';

import SubTask from './sub-task';
import { calculateSubtaskProgress } from '~/utils/task-counter';
import { useRealTimeTasks } from '../hooks/use-tasks';
import { useTranslation } from 'react-i18next';

function TaskDropdown({ tasks, userRole, orderId }: { tasks: Task.Type[]; userRole: string, orderId: string }) {

  const { createTask, createSubtask, updateTaskName, deleteTask, loading } = useRealTimeTasks();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const { t } = useTranslation('orders');

  const handleAddTask = async () => {
    console.log('Adding task');
    const newTask = {
      name: 'Nueva tarea',
      order_id: orderId,
      completed: false,
      deleted_on: null,
    }
    await createTask(newTask);
  }

  const handleAddSubtask = async (taskId: string) => {
    console.log('Adding subtask');
    const newSubtask = {
      completed: false,
      name: 'Nueva Subtarea',
      parent_task_id: taskId,
      deleted_on: null,
    }
    await createSubtask(newSubtask);
  }

  const handleEditTask = (taskId: string, currentName: string) => {
    setEditingTaskId(taskId);
    setNewTaskName(currentName);
  };

  const handleSaveTaskName = async (taskId: string) => {
    await updateTaskName(taskId, newTaskName);
    setEditingTaskId(null); 
    setNewTaskName(''); 
  };

  if (!loading && !tasks.length) {
    return (
      <div className="flex justify-center items-center flex-col">
        <p className="text-gray-500">{t('tasks.emptyTasks')}</p>
        <Button 
          variant="secondary" 
          className="mt-4 py-0 text-gray-600"
          onClick={handleAddTask}
        >
          <Plus className="mr-1 h-5 w-5" />
          <p className="text-sm">{t('tasks.addTask')}</p>
        </Button>
      </div>
    );
  }

  return (
    <div className="no-scrollbar max-h-[70vh] overflow-y-auto">
      {loading ? null : 
      <Accordion type="single" collapsible className="w-full">
        {tasks.map((task, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger onClick={(e) => e.stopPropagation()}>
              <div className="w-full">
              {editingTaskId === task.id ? (
                <p className="mb-5 flex justify-start font-semibold text-gray-900">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onBlur={() => handleSaveTaskName(task.id)} 
                    className="border-none rounded-md p-1 justify-start"
                  />
                  <X className="ml-2 h-4 w-4 text-gray-500 cursor-pointer" onClick={() => setEditingTaskId(null)} />
                </p>
                  
                ) : (
                  <p className="mb-5 flex justify-start font-semibold text-gray-900">
                    {task.name}
                    <Pen className="ml-2 h-4 w-4 text-gray-500 cursor-pointer" onClick={() => handleEditTask(task.id, task.name)} />
                    <TrashIcon className="ml-2 h-4 w-4 text-gray-500 cursor-pointer" onClick={() => deleteTask(task.id)} />
                  </p>
                )}
                <ThemedProgress value={calculateSubtaskProgress(task.subtasks ?? [])} className="w-full" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="ml-3">
              {task?.subtasks?.map((subtask, subIndex) => (
                <SubTask
                  key={subIndex}
                  initialSubtask={subtask}
                  userRole={userRole}
                />
              ))}
              <Button 
                variant="secondary" 
                className="mt-1 py-0 text-gray-600"
                onClick={() => handleAddSubtask(task.id)}
              >
                <Plus className="mr-1 h-5 w-5" />
                <p className="text-sm">{t('tasks.addSubtask')}</p>
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
        <Button 
          variant="secondary" 
          className="mt-4 py-0 text-gray-600"
          onClick={handleAddTask}
        >
          <Plus className="mr-1 h-5 w-5" />
          <p className="text-sm">{t('tasks.addTask')}</p>
        </Button>
      </Accordion>
    }
    </div>
  );
}

export default TaskDropdown;
