import { useState } from 'react';

import {
  CalendarIcon,
  FlagIcon,
  Loader,
  Plus,
  TrashIcon,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { DateRange } from '@kit/ui/calendar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@kit/ui/sheet';

import RichTextEditor from '~/components/ui/rich-text-editor';
import { Subtask } from '~/lib/tasks.types';

import { useRealTimeSubtasks } from '../hooks/use-subtasks';
import { generateDropdownOptions } from '../utils/generate-options-and-classnames';
import {
  getPriorityClassName,
  getStatusClassName,
} from '../utils/generate-options-and-classnames';
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import { DatePickerWithRange } from './range-date-picker';
import SelectAction from './ui/select-action';

function SubTasks({
  initialSubtasks,
  userRole,
  taskId,
}: {
  initialSubtasks: Subtask.Type[];
  userRole: string;
  taskId: string;
}) {
  const { t } = useTranslation('orders');
  const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
  const priorities = ['low', 'medium', 'high'];
  const statusOptions = generateDropdownOptions(statuses, t, 'statuses');
  const priorityOptions = generateDropdownOptions(priorities, t, 'priorities');

  const { subtaskList, createSubtask, updateSubtask } =
    useRealTimeSubtasks(initialSubtasks);

  const [newSubtaskName, setNewSubtaskName] = useState<string>('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');

  const handleAddSubtask = async (taskId: string) => {
    const newSubtask = {
      completed: false,
      name: t('tasks.newSubtask'),
      parent_task_id: taskId,
      deleted_on: null,
      created_at: new Date().toISOString(),
      priority: priorities[0],
      content: null,
      end_date: null,
      start_date: null,
      state: statuses[0],
    };
    await createSubtask.mutateAsync({
      newSubtask,
    });
  };
  const handleStartEditing = (subtaskId: string, currentName: string) => {
    setEditingSubtaskId(subtaskId);
    setNewSubtaskName(currentName);
  };

  const handleSaveTaskName = async (
    subtaskId: string,
    subtask: Subtask.Type,
  ) => {
    if (newSubtaskName.trim() !== '') {
      await updateSubtask.mutateAsync({
        subtaskId,
        subtask: {
          ...subtask,
          name: newSubtaskName,
        },
      });
    }
    setEditingSubtaskId(null);
    setNewSubtaskName('');
  };

  const handleStatusChange = async (
    subtaskId: string,
    subtask: Subtask.Type,
    state: string,
  ) => {
    await updateSubtask.mutateAsync({
      subtaskId,
      subtask: {
        ...subtask,
        state: state,
        completed: state === 'completed' ? true : false,
      },
    });
  };

  const handlePriorityChange = async (
    subtaskId: string,
    subtask: Subtask.Type,
    priority: string,
  ) => {
    await updateSubtask.mutateAsync({
      subtaskId,
      subtask: {
        ...subtask,
        priority: priority,
      },
    });
  };

  const handleDateRangeChange = async (
    subtaskId: string,
    subtask: Subtask.Type,
    selectedPeriod: DateRange | undefined,
  ) => {
    await updateSubtask.mutateAsync({
      subtaskId,
      subtask: {
        ...subtask,
        start_date: selectedPeriod?.from
          ? selectedPeriod?.from.toISOString()
          : null,
        end_date: selectedPeriod?.to ? selectedPeriod?.to.toISOString() : null,
      },
    });
  };

  const handleContentChange = async (
    subtaskId: string,
    subtask: Subtask.Type,
    content: string,
  ) => {
    await updateSubtask.mutateAsync({
      subtaskId,
      subtask: {
        ...subtask,
        content: content,
      },
    });
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent,
    subtaskId: string,
    subtask: Subtask.Type,
  ) => {
    if (e.key === 'Enter') {
      await handleSaveTaskName(subtaskId, subtask);
    } else if (e.key === 'Escape') {
      setEditingSubtaskId(null);
      setNewSubtaskName('');
    }
  };

  // Map through the subtasks to render each one
  return (
    <div>
      {subtaskList
        .filter((subtask) => !subtask.deleted_on)
        .sort((a, b) => a.position - b.position)
        .map((subtask) => {
          return (
            <div
              key={subtask.id}
              className="flex items-center justify-between py-3"
              onMouseEnter={() => setHoveredTaskId(subtask.id)}
              onMouseLeave={() => setHoveredTaskId(null)}
            >
              {editingSubtaskId === subtask.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onBlur={() => handleSaveTaskName(subtask.id, subtask)}
                    onKeyDown={(e) => handleKeyDown(e, subtask.id, subtask)}
                    className="w-full rounded-md border-none bg-transparent p-2 font-semibold text-gray-900 focus:outline-none"
                    autoFocus
                  />
                  <X
                    className="ml-2 h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setEditingSubtaskId(null)}
                  />
                </div>
              ) : (
                <p
                  className="font-semibold text-gray-900"
                  onMouseEnter={() => setHoveredTaskId(subtask.id)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                  onClick={() => handleStartEditing(subtask.id, subtask.name)}
                >
                  {subtask.name}
                </p>
              )}

              <div className="flex items-center gap-2">
                {hoveredTaskId === subtask.id && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        className="mr-4 bg-gray-200 text-gray-500"
                        type="button"
                      >
                        {t('openOrders')}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className='max-w-[300px] sm:max-w-[700px]'>
                      <SheetHeader>
                        <SheetTitle>
                          {editingSubtaskId === subtask.id ? (
                            <input
                              type="text"
                              value={newSubtaskName}
                              onChange={(e) =>
                                setNewSubtaskName(e.target.value)
                              }
                              onBlur={() =>
                                handleSaveTaskName(subtask.id, subtask)
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(e, subtask.id, subtask)
                              }
                              className="w-full rounded-md border-none bg-transparent p-2 font-semibold text-gray-900 focus:outline-none"
                              // autoFocus
                            />
                          ) : (
                            <div className="flex w-full items-center justify-between">
                              <p
                                className="flex-grow font-semibold text-gray-900"
                                onClick={() =>
                                  handleStartEditing(subtask.id, subtask.name)
                                }
                              >
                                {subtask.name}
                              </p>
                            </div>
                          )}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                          <span className="flex text-sm font-semibold">
                            <CalendarIcon className="mr-2 h-4 w-4" />{' '}
                            {t('details.deadline')}{' '}
                          </span>
                          <DatePickerWithRange
                            initialPeriod={
                              subtask.start_date && subtask.end_date
                                ? {
                                    from: new Date(subtask.start_date),
                                    to: new Date(subtask.end_date),
                                  }
                                : undefined
                            }
                            handlePeriod={
                              handleDateRangeChange
                            }
                            subtask={subtask}
                            subtaskId={subtask.id}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex text-sm font-semibold">
                            <Loader className="mr-2 h-4 w-4" />
                          </span>
                          <SelectAction
                            options={statusOptions}
                            groupName={t('details.status')}
                            defaultValue={subtask.state}
                            getitemClassName={getStatusClassName}
                            className={
                              statusColors[
                                subtask.state as
                                  | 'pending'
                                  | 'in_progress'
                                  | 'completed'
                                  | 'in_review'
                              ]
                            }
                            onSelectHandler={(value) => {
                              handleStatusChange(
                                subtask.id,
                                subtask,
                                value,
                              ).catch((error) => console.error(error));
                            }}
                            showLabel={true}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex text-sm font-semibold">
                            <FlagIcon className="mr-2 h-4 w-4" />
                          </span>
                          <SelectAction
                            options={priorityOptions}
                            groupName={t('details.priority')}
                            defaultValue={subtask.priority}
                            getitemClassName={getPriorityClassName}
                            className={
                              priorityColors[
                                subtask.priority as 'low' | 'medium' | 'high'
                              ]
                            }
                            onSelectHandler={(value) => {
                              handlePriorityChange(
                                subtask.id,
                                subtask,
                                value,
                              ).catch((error) => console.error(error));
                            }}
                            showLabel={true}
                          />
                        </div>

                        <RichTextEditor
                          content={subtask.content}
                          onChange={(value) => {
                            if (value) {
                              setContent(value);
                            } else {
                              setContent('');
                            }
                          }}
                          onBlur={() => {
                            handleContentChange(
                              subtask.id,
                              subtask,
                              content,
                            ).catch((error) => console.error(error));
                          }}
                          userRole={userRole}
                          hideSubmitButton={true}
                          showToolbar={true}
                          isEditable={true}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
                <SelectAction
                  options={statusOptions}
                  groupName={t('details.status')}
                  defaultValue={subtask.state}
                  getitemClassName={getStatusClassName}
                  className={
                    statusColors[
                      subtask.state as
                        | 'pending'
                        | 'in_progress'
                        | 'completed'
                        | 'in_review'
                    ]
                  }
                  onSelectHandler={(value) => {
                    handleStatusChange(subtask.id, subtask, value).catch(
                      (error) => console.error(error),
                    );
                  }}
                  showLabel={false}
                />

                <SelectAction
                  options={priorityOptions}
                  groupName={t('details.priority')}
                  defaultValue={subtask.priority}
                  getitemClassName={getPriorityClassName}
                  className={
                    priorityColors[
                      subtask.priority as 'low' | 'medium' | 'high'
                    ]
                  }
                  onSelectHandler={(value) => {
                    handlePriorityChange(subtask.id, subtask, value).catch(
                      (error) => console.error(error),
                    );
                  }}
                  showLabel={false}
                />

                <DatePickerWithRange
                  shortFormat={true}
                  initialPeriod={
                    subtask.start_date && subtask.end_date
                      ? {
                          from: new Date(subtask.start_date),
                          to: new Date(subtask.end_date),
                        }
                      : undefined
                  }
                  handlePeriod={handleDateRangeChange}
                  subtask={subtask}
                  subtaskId={subtask.id}

                />
                {hoveredTaskId === subtask.id && (
                  <div className="h-4 w-4 ml-3">
                    <TrashIcon
                      className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                      onClick={async () =>
                        await updateSubtask.mutateAsync({
                          subtaskId: subtask.id,
                          subtask: {
                            ...subtask,
                            deleted_on: new Date().toISOString(),
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      <Button
        variant="secondary"
        className="mt-1 py-0 text-gray-600"
        onClick={() => handleAddSubtask(taskId)}
      >
        <Plus className="mr-1 h-5 w-5" />
        <p className="text-sm">{t('tasks.addSubtask')}</p>
      </Button>
    </div>
  );
}

export default SubTasks;
