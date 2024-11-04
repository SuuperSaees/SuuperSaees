import { useState } from 'react';

import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';

import { SortableItem } from '~/components/sortable-item';
import RichTextEditorV2 from '~/components/ui/rich-text-editor-v2';
import { Subtask } from '~/lib/tasks.types';

import { createHandlers } from '../hooks/subtasks/subtask-handlers';
import { useRealTimeSubtasks } from '../hooks/use-subtasks';
import { generateDropdownOptions } from '../utils/generate-options-and-classnames';
import {
  getPriorityClassName,
  getStatusClassName,
} from '../utils/generate-options-and-classnames';
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import { DatePickerWithRange } from './range-date-picker';
import StatusCombobox from './status-combobox';
import SubtaskAssignations from './subtasks/subtask-assignations';
import SubtaskFollowers from './subtasks/subtask-followers';
import SelectAction from './ui/select-action';

function SubTasks({
  initialSubtasks,
  userRole,
  taskId,
  orderId,
  orderAgencyId,
}: {
  initialSubtasks: Subtask.Type[];
  userRole: string;
  taskId: string;
  orderId: string;
  orderAgencyId: string;
}) {
  const { t } = useTranslation('orders');
  const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
  const priorities = ['low', 'medium', 'high'];
  const statusOptions = generateDropdownOptions(statuses, t, 'statuses');
  const priorityOptions = generateDropdownOptions(priorities, t, 'priorities');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    subtaskList,
    createSubtask,
    updateSubtask,
    handleDragEnd,
    handleDragStart,
    sensors,
    searchUserOptions,
    changeAgencyMembersAssigned,
    searchUserOptionsFollowers,
    changeAgencyMembersFollowers,
  } = useRealTimeSubtasks(initialSubtasks, orderId, orderAgencyId, userRole);

  const [newSubtaskName, setNewSubtaskName] = useState<string>('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');

  const handlers = createHandlers(
    updateSubtask,
    createSubtask,
    setEditingSubtaskId,
    setNewSubtaskName,
    changeAgencyMembersAssigned,
    changeAgencyMembersFollowers,
    t,
  );

  const handleSheetOpen = (subtaskId: string) => {
    setHoveredTaskId(subtaskId);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setHoveredTaskId(null);
    setIsSheetOpen(false);
  };

  // Map through the subtasks to render each one
  return (
    <div>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
        collisionDetection={closestCorners}
      >
        <SortableContext items={subtaskList}>
          {subtaskList
            .filter((subtask) => !subtask.deleted_on)
            .sort((a, b) => a.position - b.position)
            .map((subtask) => (
              <SortableItem
                key={subtask.id}
                id={subtask.id}
                className="items-center"
              >
                <div
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
                        onBlur={() =>
                          handlers.handleSaveTaskName(
                            subtask.id,
                            subtask,
                            newSubtaskName,
                          )
                        }
                        onKeyDown={(e) =>
                          handlers.handleKeyDown(
                            e,
                            subtask.id,
                            subtask,
                            newSubtaskName,
                          )
                        }
                        className="w-full rounded-md border-none bg-transparent font-semibold text-gray-900 focus:outline-none"
                        autoFocus
                      />
                      <X
                        className="ml-2 h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
                        onClick={() => setEditingSubtaskId(null)}
                      />
                    </div>
                  ) : (
                    <p
                      className="mr-4 max-w-[calc(100%-40px)] overflow-hidden truncate text-ellipsis font-semibold text-gray-900"
                      onMouseEnter={() => setHoveredTaskId(subtask.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      onClick={() =>
                        handlers.handleStartEditing(subtask.id, subtask.name)
                      }
                    >
                      {subtask.name}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    {hoveredTaskId === subtask.id && (
                      <Button
                        className="mr-4 bg-gray-200 text-gray-500 hover:bg-slate-200"
                        type="button"
                        onClick={() => handleSheetOpen(subtask.id)}
                      >
                        {t('openOrders')}
                      </Button>
                    )}
                    <Sheet open={isSheetOpen}>
                      <SheetContent
                        className="max-w-[300px] sm:max-w-[700px]"
                        onInteractOutside={handleSheetClose}
                      >
                        <SheetHeader>
                          <div className="flex justify-between">
                            <SheetTitle>
                              {editingSubtaskId === subtask.id ? (
                                <input
                                  type="text"
                                  value={newSubtaskName}
                                  onChange={(e) =>
                                    setNewSubtaskName(e.target.value)
                                  }
                                  onBlur={() =>
                                    handlers.handleSaveTaskName(
                                      subtask.id,
                                      subtask,
                                      newSubtaskName,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    handlers.handleKeyDown(
                                      e,
                                      subtask.id,
                                      subtask,
                                      newSubtaskName,
                                    )
                                  }
                                  className="w-full rounded-md border-none bg-transparent text-xl font-semibold text-gray-900 focus:outline-none"
                                />
                              ) : (
                                <div className="mr-2 flex w-full items-center justify-between">
                                  <p
                                    className="flex-grow text-xl font-semibold text-gray-900"
                                    onClick={() =>
                                      handlers.handleStartEditing(
                                        subtask.id,
                                        subtask.name,
                                      )
                                    }
                                  >
                                    {subtask.name}
                                  </p>
                                </div>
                              )}
                            </SheetTitle>
                            <SheetClose
                              onClick={handleSheetClose}
                              className="absolute right-0 top-0 mr-4 mt-4"
                            >
                              <X className="h-4 w-4" />
                            </SheetClose>
                          </div>
                        </SheetHeader>
                        <div className="grid gap-3 py-4">
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
                              handlePeriod={handlers.handleDateRangeChange}
                              subtask={subtask}
                              subtaskId={subtask.id}
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex text-sm font-semibold">
                              <Loader className="mr-2 h-4 w-4" />
                              <p>{t('details.status')}</p>
                            </span>
                            <StatusCombobox
                              subtask={subtask}
                              agency_id={orderAgencyId}
                              mode="subtask"
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
                                handlers
                                  .handlePriorityChange(
                                    subtask.id,
                                    subtask,
                                    value,
                                  )
                                  .catch((error) => console.error(error));
                              }}
                              showLabel={true}
                            />
                          </div>

                          <SubtaskAssignations
                            onUserSelectionChange={(selectedUsers) =>
                              handlers.handleUpdateAssignedTo(
                                subtask.id,
                                selectedUsers,
                              )
                            }
                            searchUserOptions={searchUserOptions}
                            subtaskId={subtask.id}
                            userRole={userRole}
                          />

                          <SubtaskFollowers
                            onUserSelectionChange={(selectedUsers) =>
                              handlers.handleUpdateFollowers(
                                subtask.id,
                                selectedUsers,
                              )
                            }
                            searchUserOptions={searchUserOptionsFollowers}
                            subtaskId={subtask.id}
                            userRole={userRole}
                          />

                          <div className="h-full">
                            <RichTextEditorV2
                              content={subtask.content}
                              onChange={(value) => {
                                if (value) {
                                  setContent(value);
                                } else {
                                  setContent('');
                                }
                              }}
                              onBlur={() => {
                                handlers
                                  .handleContentChange(
                                    subtask.id,
                                    subtask,
                                    content,
                                  )
                                  .catch((error) => console.error(error));
                              }}
                              userRole={userRole}
                              hideSubmitButton={true}
                              showToolbar={true}
                              isEditable={true}
                            />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                    <StatusCombobox
                      subtask={subtask}
                      agency_id={orderAgencyId}
                      mode="subtask"
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
                        handlers
                          .handlePriorityChange(subtask.id, subtask, value)
                          .catch((error) => console.error(error));
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
                      handlePeriod={handlers.handleDateRangeChange}
                      subtask={subtask}
                      subtaskId={subtask.id}
                    />
                    <div className="ml-3 h-4 w-4">
                      <TrashIcon
                        className={`h-4 w-4 cursor-pointer ${hoveredTaskId === subtask.id ? 'text-gray-500 hover:text-red-500' : 'text-transparent'}`}
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
                  </div>
                </div>
              </SortableItem>
            ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="secondary"
        className="mt-1 py-0 text-gray-600"
        onClick={() => handlers.handleAddSubtask(taskId)}
      >
        <Plus className="mr-1 h-4 w-4" />
        <p className="text-sm">{t('tasks.addSubtask')}</p>
      </Button>
    </div>
  );
}

export default SubTasks;
