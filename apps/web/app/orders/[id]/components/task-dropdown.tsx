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
import { SkeletonBox } from '~/components/ui/skeleton'
import { calculateSubtaskProgress } from '~/utils/task-counter';

import { useRealTimeTasks } from '../hooks/use-tasks';
import { SortableItem } from '~/components/sortable-item';
import { useRealTimeSubtasks } from '../hooks/use-subtasks';
import { createHandlers } from '../hooks/subtasks/subtask-handlers';
import { generateDropdownOptions, getPriorityClassName } from '../utils/generate-options-and-classnames';
import { priorityColors } from '../utils/get-color-class-styles';
import SubtaskItem from './subtasks/subtask-item';
import { AgencyStatusesProvider } from '../../components/context/agency-statuses-context';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Task } from '~/lib/tasks.types';
import EmptyState from '~/components/ui/empty-state';

// New type definitions
type TaskProps = {
  task: Task.Type;
  index: number;
  isEditable: boolean;
  editingTaskId: string | null;
  newTaskName: string;
  hoveredTaskId: string | null;
  handlers: TaskHandlers;
  subtaskHandlers: ReturnType<typeof createHandlers>;
  subtaskProps: SubtaskProps;
};

type SubtaskProps = {
  subtasks: any[];
  editingSubtaskId: string | null;
  hoveredSubtaskId: string | null;
  newSubtaskName: string;
  setNewSubtaskName: (name: string) => void;
  searchUserOptions: any;
  searchUserOptionsFollowers: any;
  priorityOptions: any;
  userRole: string;
  orderAgencyId: string;
  updateSubtask: any;
  currentUserId: string;
};

// New custom hook for task handlers
function useTaskHandlers(orderId: string, updateTaskName: any, deleteTask: any) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const { t } = useTranslation('orders');

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

  return {
    editingTaskId,
    newTaskName,
    hoveredTaskId,
    setHoveredTaskId,
    setNewTaskName,
    handleStartEditing,
    handleSaveTaskName,
    handleKeyDown,
  };
}

// New TaskContent component
function TaskContent({ task, index, isEditable, editingTaskId, newTaskName, hoveredTaskId, handlers, subtaskHandlers, subtaskProps }: TaskProps) {
  const { t } = useTranslation('orders');
  const filteredSubtasks = subtaskProps.subtasks
    .filter((subtask) => subtask.parent_task_id === task.id)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        {editingTaskId === task.id ? (
          <div className="flex flex-grow items-center">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => subtaskProps.setNewSubtaskName(e.target.value)}
              onBlur={() => handlers.handleSaveTaskName(task.id)}
              onKeyDown={(e) => handlers.handleKeyDown(e, task.id)}
              className="w-full rounded-md border-none bg-transparent font-medium text-sm text-gray-900 focus:outline-none"
              autoFocus
            />
            <X
              className="ml-2 h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => handlers.setEditingTaskId(null)}
            />
          </div>
        ) : (
          <div
            className="flex w-full items-center justify-between"
            onMouseEnter={() => subtaskProps.setHoveredTaskId(task.id)}
            onMouseLeave={() => subtaskProps.setHoveredTaskId(null)}
          >
            <p
              className="flex-grow font-medium text-sm text-gray-900"
              onClick={() => isEditable ? handlers.handleStartEditing(task.id, task.name ?? '') : undefined}
            >
              {task.name}
            </p>
            {hoveredTaskId === task.id && isEditable && (
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
              value={calculateSubtaskProgress(filteredSubtasks ?? [])}
              className="w-full"
            />
          </AccordionTrigger>
          <AccordionContent className='ml-10'>
            {filteredSubtasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-sm text-gray-500">{t('tasks.emptySubtasks')}</p>
              </div>
            ) : (
              isEditable ? (
                <DndContext
                  onDragEnd={subtaskHandlers.handleDragEnd}
                  onDragStart={subtaskHandlers.handleDragStart}
                  sensors={subtaskHandlers.sensors}
                  collisionDetection={closestCorners}
                >
                  <SortableContext items={filteredSubtasks}>
                    {filteredSubtasks.map((subtask) => (
                      <SortableItem key={subtask.id} id={subtask.id} className="items-center">
                        <SubtaskItem
                          subtask={subtask}
                          isEditing={subtaskProps.editingSubtaskId === subtask.id}
                          isHovered={subtaskProps.hoveredSubtaskId === subtask.id}
                          onHover={(id) => subtaskProps.setHoveredSubtaskId(id)}
                          onEdit={() => subtaskHandlers.handleStartEditing(subtask.id, subtask.name ?? '')}
                          newSubtaskName={subtaskProps.newSubtaskName}
                          setNewSubtaskName={(name) => subtaskProps.setNewSubtaskName(name)}
                          handleDateRangeChange={subtaskHandlers.handleDateRangeChange}
                          handlePriorityChange={(value) =>
                            subtaskHandlers.handlePriorityChange(subtask.id, subtask, value).catch(console.error)
                          }
                          handleAssignedToChange={(selectedUsers) =>
                            subtaskHandlers.handleUpdateAssignedTo(subtask.id, selectedUsers)
                          }
                          handleFollowersChange={(selectedUsers) =>
                            subtaskHandlers.handleUpdateFollowers(subtask.id, selectedUsers)
                          }
                          handleContentChange={(value) =>
                            subtaskHandlers.handleContentChange(subtask.id, subtask, value)
                          }
                          handleSaveTaskName={() => subtaskHandlers.handleSaveTaskName(subtask.id, subtask, subtaskProps.newSubtaskName)}
                          handleKeyDown={(e) => subtaskHandlers.handleKeyDown(e, subtask.id, subtask, subtaskProps.newSubtaskName)}
                          searchUserOptions={subtaskProps.searchUserOptions}
                          searchUserOptionsFollowers={subtaskProps.searchUserOptionsFollowers}
                          priorityOptions={subtaskProps.priorityOptions}
                          getPriorityClassName={getPriorityClassName}
                          priorityColors={priorityColors}
                          userRole={subtaskProps.userRole}
                          orderAgencyId={subtaskProps.orderAgencyId}
                          updateSubtask={subtaskProps.updateSubtask}
                          currentUserId={subtaskProps.currentUserId}
                        />
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                filteredSubtasks.map((subtask) => (
                  <div key={subtask.id}>
                    <SubtaskItem
                      subtask={subtask}
                      isEditing={subtaskProps.editingSubtaskId === subtask.id}
                      isHovered={subtaskProps.hoveredSubtaskId === subtask.id}
                      onHover={(id) => subtaskProps.setHoveredSubtaskId(id)}
                      onEdit={() => subtaskHandlers.handleStartEditing(subtask.id, subtask.name ?? '')}
                      newSubtaskName={subtaskProps.newSubtaskName}
                      setNewSubtaskName={(name) => subtaskProps.setNewSubtaskName(name)}
                      handleDateRangeChange={subtaskHandlers.handleDateRangeChange}
                      handlePriorityChange={(value) =>
                        subtaskHandlers.handlePriorityChange(subtask.id, subtask, value).catch(console.error)
                      }
                      handleAssignedToChange={(selectedUsers) =>
                        subtaskHandlers.handleUpdateAssignedTo(subtask.id, selectedUsers)
                      }
                      handleFollowersChange={(selectedUsers) =>
                        subtaskHandlers.handleUpdateFollowers(subtask.id, selectedUsers)
                      }
                      handleContentChange={(value) =>
                        subtaskHandlers.handleContentChange(subtask.id, subtask, value)
                      }
                      handleSaveTaskName={() => subtaskHandlers.handleSaveTaskName(subtask.id, subtask, subtaskProps.newSubtaskName)}
                      handleKeyDown={(e) => subtaskHandlers.handleKeyDown(e, subtask.id, subtask, subtaskProps.newSubtaskName)}
                      searchUserOptions={subtaskProps.searchUserOptions}
                      searchUserOptionsFollowers={subtaskProps.searchUserOptionsFollowers}
                      priorityOptions={subtaskProps.priorityOptions}
                      getPriorityClassName={getPriorityClassName}
                      priorityColors={priorityColors}
                      userRole={subtaskProps.userRole}
                      orderAgencyId={subtaskProps.orderAgencyId}
                      updateSubtask={subtaskProps.updateSubtask}
                      currentUserId={subtaskProps.currentUserId}
                    />
                  </div>
                ))
              )
            )}
            {isEditable && (
              <Button
                variant="secondary"
                className="mt-1 py-0 text-gray-600"
                onClick={() => subtaskHandlers.handleAddSubtask(task.id)}
              >
                <Plus className="mr-1 h-4 w-4" />
                <p className="text-sm">{t('tasks.addSubtask')}</p>
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function TaskDropdown({
  userRole,
  orderId,
  orderAgencyId,
  agencyStatuses,
}: {
  userRole: string;
  orderId: string;
  orderAgencyId: string;
  agencyStatuses: AgencyStatus.Type[];
}) {
  const {
    tasks,
    subtasks,
    createTask,
    updateTaskName,
    deleteTask,
    loading,
    handleDragStart,
    handleDragEnd,
    sensors
  } = useRealTimeTasks(orderId);

  const taskHandlers = useTaskHandlers(orderId, updateTaskName, deleteTask);
  const { t } = useTranslation('orders');
  const { user } = useUserWorkspace();

  // Subtask states and handlers setup
  const [newSubtaskName, setNewSubtaskName] = useState<string>('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [hoveredSubtaskId, setHoveredSubtaskId] = useState<string | null>(null);
  
  const priorities = ['low', 'medium', 'high'];
  const priorityOptions = generateDropdownOptions(priorities, t, 'priorities');

  const {
    createSubtask,
    updateSubtask,
    handleDragEnd: handleDragEndSubtask,
    handleDragStart: handleDragStartSubtask,
    sensors: sensorsSubtask,
    searchUserOptions,
    changeAgencyMembersAssigned,
    searchUserOptionsFollowers,
    changeAgencyMembersFollowers,
  } = useRealTimeSubtasks(orderId, orderAgencyId, userRole);

  const handlers = createHandlers(
    updateSubtask,
    createSubtask,
    setEditingSubtaskId,
    setNewSubtaskName,
    changeAgencyMembersAssigned,
    changeAgencyMembersFollowers,
    t,
  );

  const canEditSubtask = (userRole: string) => {
    return ['agency_owner', 'agency_member', 'agency_project_manager'].includes(userRole);
  };
  
  const isEditable = canEditSubtask(userRole);

  if (!loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <EmptyState
          title={t('tasks.emptyTasks')}
          description={
            isEditable ? t('tasks.emptyTasksDescription') : t('tasks.emptyTasksDescriptionToClient')
          }
          imageSrc="/images/illustrations/Illustration-files.svg"
          button={
            isEditable ? (
              <Button variant="secondary" className="mt-4 py-0 text-gray-600" onClick={() => createTask.mutateAsync({
                name: t('tasks.newTask'),
                order_id: Number(orderId),
                completed: false,
                deleted_on: null,
                created_at: new Date().toISOString(),
                position: null,
              })}>
                <Plus className="mr-1 h-4 w-4" />
                <p className="text-sm">{t('tasks.addTask')}</p>
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <AgencyStatusesProvider initialStatuses={agencyStatuses}>
      <div className="no-scrollbar max-h-[76vh] overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4">
                <SkeletonBox className="h-6 w-3/4 mb-2" />
                <SkeletonBox className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {isEditable ? (
              <DndContext
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                sensors={sensors}
                collisionDetection={closestCorners}
              >
                <SortableContext items={tasks}>
                  {tasks
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((task, index) => (
                      <SortableItem key={task.id} id={task.id}>
                        <TaskContent
                          task={task}
                          index={index}
                          isEditable={isEditable}
                          editingTaskId={taskHandlers.editingTaskId}
                          newTaskName={taskHandlers.newTaskName}
                          hoveredTaskId={taskHandlers.hoveredTaskId}
                          handlers={taskHandlers}
                          subtaskHandlers={handlers}
                          subtaskProps={{
                            subtasks,
                            editingSubtaskId,
                            hoveredSubtaskId,
                            newSubtaskName,
                            setNewSubtaskName,
                            searchUserOptions,
                            searchUserOptionsFollowers,
                            priorityOptions,
                            userRole,
                            orderAgencyId,
                            updateSubtask,
                            currentUserId: user.id,
                          }}
                        />
                      </SortableItem>
                    ))}
                </SortableContext>
              </DndContext>
            ) : (
              tasks
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((task, index) => (
                  <TaskContent
                    key={task.id}
                    task={task}
                    index={index}
                    isEditable={isEditable}
                    editingTaskId={null}
                    newTaskName=""
                    hoveredTaskId={null}
                    handlers={taskHandlers}
                    subtaskHandlers={handlers}
                    subtaskProps={{
                      subtasks,
                      editingSubtaskId,
                      hoveredSubtaskId,
                      newSubtaskName,
                      setNewSubtaskName,
                      searchUserOptions,
                      searchUserOptionsFollowers,
                      priorityOptions,
                      userRole,
                      orderAgencyId,
                      updateSubtask,
                      currentUserId: user.id,
                    }}
                  />
                ))
            )}
            
            {isEditable && (
              <Button
                variant="secondary"
                className="mt-4 py-0 text-gray-600"
                onClick={() => createTask.mutateAsync({
                  name: t('tasks.newTask'),
                  order_id: Number(orderId),
                  completed: false,
                  deleted_on: null,
                  created_at: new Date().toISOString(),
                  position: null,
                })}
              >
                <Plus className="mr-1 h-4 w-4" />
                <p className="text-sm">{t('tasks.addTask')}</p>
              </Button>
            )}
          </>
        )}
      </div>
    </AgencyStatusesProvider>
  );
}

export default TaskDropdown;


