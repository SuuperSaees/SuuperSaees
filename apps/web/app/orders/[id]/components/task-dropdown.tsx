import * as React from 'react';
import { useState } from 'react';

import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Plus, TrashIcon, X } from 'lucide-react';
import { ThemedProgress } from 'node_modules/@kit/accounts/src/components/ui/progress-themed-with-settings';
import { useTranslation } from 'react-i18next';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import { calculateSubtaskProgress } from '~/utils/task-counter';

import { useRealTimeTasks } from '../hooks/use-tasks';
import SubTasks from './sub-task';
import { SortableItem } from '~/components/sortable-item';

function TaskDropdown({
  userRole,
  orderId,
  orderAgencyId,
}: {
  userRole: string;
  orderId: string;
  orderAgencyId: string;
}) {
  const {
    tasks,
    createTask,
    updateTaskName,
    deleteTask,
    loading,
    handleDragStart,
    handleDragEnd,
    sensors
  } = useRealTimeTasks(orderId);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const { t } = useTranslation('orders');

  const handleAddTask = async () => {
    const newTask = {
      name: t('tasks.newTask'),
      order_id: orderId,
      completed: false,
      deleted_on: null,
      created_at: new Date().toISOString(),
    };
    await createTask.mutateAsync({
      newTask,
    });
  };

  const handleStartEditing = (taskId: string, currentName: string) => {
    setEditingTaskId(taskId);
    setNewTaskName(currentName);
  };

  const handleSaveTaskName = async (taskId: string) => {
    if (newTaskName.trim() !== '') {
      await updateTaskName.mutateAsync({
        taskId,
        newName: newTaskName.trim(),
      });
    }
    setEditingTaskId(null);
    setNewTaskName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      handleSaveTaskName(taskId).catch((error) => console.error(error));
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
      setNewTaskName('');
    }
  };

  if (!loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-gray-500">{t('tasks.emptyTasks')}</p>
        <Button
          variant="secondary"
          className="mt-4 py-0 text-gray-600"
          onClick={handleAddTask}
        >
          <Plus className="mr-1 h-4 w-4" />
          <p className="text-sm">{t('tasks.addTask')}</p>
        </Button>
      </div>
    );
  }

  return (
    <div className="no-scrollbar max-h-[76vh] overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <DndContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            sensors={sensors}
            collisionDetection={closestCorners}
          >
            <SortableContext items={tasks}>
              {tasks.map((task, index) => (
                <SortableItem id={task.id} key={task.id}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      {editingTaskId === task.id ? (
                        <div className="flex flex-grow items-center">
                          <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            onBlur={() => handleSaveTaskName(task.id)}
                            onKeyDown={(e) => handleKeyDown(e, task.id)}
                            className="w-full rounded-md border-none bg-transparent p-2 font-semibold text-gray-900 focus:outline-none"
                            autoFocus
                          />
                          <X
                            className="ml-2 h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
                            onClick={() => setEditingTaskId(null)}
                          />
                        </div>
                      ) : (
                        <div
                          className="flex w-full items-center justify-between"
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                        >
                          <p
                            className="flex-grow font-semibold text-gray-900"
                            onClick={() =>
                              handleStartEditing(task.id, task.name)
                            }
                          >
                            {task.name}
                          </p>
                          {hoveredTaskId === task.id && (
                            <TrashIcon
                              className="ml-2 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                              onClick={async () =>
                                await deleteTask.mutateAsync({
                                  taskId: task.id,
                                })
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={`item-${index}`}>
                        <AccordionTrigger>
                          <ThemedProgress
                            value={calculateSubtaskProgress(
                              task.subtasks.filter(
                                (subtask) => !subtask.deleted_on,
                              ) ?? [],
                            )}
                            className="w-full"
                          />
                        </AccordionTrigger>
                        <AccordionContent className='ml-10'>
                          <SubTasks
                            initialSubtasks={task.subtasks}
                            userRole={userRole}
                            taskId={task.id}
                            orderId={orderId}
                            orderAgencyId={orderAgencyId}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
          <Button
            variant="secondary"
            className="mt-4 py-0 text-gray-600"
            onClick={handleAddTask}
          >
            <Plus className="mr-1 h-4 w-4" />
            <p className="text-sm">{t('tasks.addTask')}</p>
          </Button>
        </>
      )}
    </div>
  );
}

export default TaskDropdown;
