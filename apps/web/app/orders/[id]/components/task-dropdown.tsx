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

import { Task } from '~/lib/tasks.types';
import { useTaskDragAndDrop } from '~/orders/[id]/hooks/use-task-drag-and-drop';
import { calculateSubtaskProgress } from '~/utils/task-counter';

import { useRealTimeTasks } from '../hooks/use-tasks';
import { SortableTask } from './sortable-task';
import SubTask from './sub-task';

function TaskDropdown({
  tasks,
  userRole,
  orderId,
}: {
  tasks: Task.Type[];
  userRole: string;
  orderId: string;
}) {
  const { createTask, createSubtask, updateTaskName, deleteTask, loading } =
    useRealTimeTasks(orderId);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const { t } = useTranslation('orders');
  const { handleDragStart, handleDragEnd, sensors, taskList } =
    useTaskDragAndDrop(
      tasks.sort((a, b) => a.position - b.position),
      orderId,
    );

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

  const handleAddSubtask = async (taskId: string) => {
    const newSubtask = {
      completed: false,
      name: t('tasks.newSubtask'),
      parent_task_id: taskId,
      deleted_on: null,
      created_at: new Date().toISOString(),
      priority: null,
      content: null,
      end_date: null,
      start_date: null,
      state: null,
    };
    await createSubtask.mutateAsync({
      newSubtask,
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

  if (!loading && taskList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
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
            <SortableContext items={taskList}>
              {taskList.map((task, index) => (
                <SortableTask key={task.id} task={task} type="task">
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
                            className="w-full rounded-md border-none p-2 font-semibold text-gray-900 focus:outline-none"
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
                              task.subtasks ?? [],
                            )}
                            className="w-full"
                          />
                        </AccordionTrigger>
                        <AccordionContent>
                          <SortableContext
                            items={(task as Task.Type)?.subtasks}
                          >
                            {task?.subtasks?.map((subtask, subIndex) => (
                              <SortableTask
                                key={subIndex}
                                task={subtask}
                                type="subtask"
                              >
                                <SubTask
                                  key={subIndex}
                                  initialSubtask={subtask}
                                  userRole={userRole}
                                />
                              </SortableTask>
                            ))}
                          </SortableContext>
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
                    </Accordion>
                  </div>
                </SortableTask>
              ))}
            </SortableContext>
          </DndContext>
          <Button
            variant="secondary"
            className="mt-4 py-0 text-gray-600"
            onClick={handleAddTask}
          >
            <Plus className="mr-1 h-5 w-5" />
            <p className="text-sm">{t('tasks.addTask')}</p>
          </Button>
        </>
      )}
    </div>
  );
}

export default TaskDropdown;
