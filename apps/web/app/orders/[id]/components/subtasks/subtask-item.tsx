import { useState } from 'react';
import React from 'react';

import { UseMutationResult } from '@tanstack/react-query';
import { CalendarIcon, FlagIcon, Loader, TrashIcon, X } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { DateRange } from '@kit/ui/calendar';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@kit/ui/sheet';
import { Tabs, TabsList, TabsContent } from '@kit/ui/tabs';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

import RichTextEditorV2 from '~/components/ui/rich-text-editor-v2';
import { Subtask } from '~/lib/tasks.types';

import { DatePickerWithRange } from '../range-date-picker';
import StatusCombobox from '../status-combobox';
import SubtaskAssignations from './subtask-assignations';
import SubtaskFollowers from './subtask-followers';
import { PriorityCombobox } from '../priority-combobox';
import { TimeTracker } from '../time-tracker';
import SubtaskTimers from './subtask-timers';

const SubtaskItem = ({
  t,
  subtask,
  isEditing,
  isHovered,
  onHover,
  onEdit,
  newSubtaskName,
  setNewSubtaskName,
  handleDateRangeChange,
  handlePriorityChange,
  handleAssignedToChange,
  handleFollowersChange,
  handleContentChange,
  handleSaveTaskName,
  handleKeyDown,
  searchUserOptions,
  searchUserOptionsFollowers,
  priorityOptions,
  getPriorityClassName,
  priorityColors,
  userRole,
  orderAgencyId,
  updateSubtask,
  ...props
}: {
  t: any;
  subtask: Subtask.Type;
  isEditing: boolean;
  isHovered: boolean;
  onHover: (id: string) => void;
  onEdit: () => void;
  newSubtaskName: string;
  setNewSubtaskName: (name: string) => void;
  handleDateRangeChange: (
    subtaskId: string,
    subtask: Subtask.Type,
    selectedPeriod: DateRange | undefined,
  ) => Promise<void>;
  handlePriorityChange: (priority: string) => Promise<void>;
  handleAssignedToChange: (selectedUsers: any[]) => Promise<void>;
  handleFollowersChange: (selectedUsers: any[]) => Promise<void>;
  handleContentChange: (content: string) => Promise<void>;
  handleSaveTaskName: (
    subtaskId: string,
    subtask: Subtask.Type,
    name: string,
  ) => Promise<void>;
  handleKeyDown: (
    e: React.KeyboardEvent,
    subtaskId: string,
    subtask: Subtask.Type,
    newSubtaskName: string,
  ) => Promise<void>;
  searchUserOptions: {
    picture_url: string | null;
    value: string;
    label: string;
  }[];
  searchUserOptionsFollowers: {
    picture_url: string | null;
    value: string;
    label: string;
  }[];
  priorityOptions: { value: string; label: string }[];
  getPriorityClassName: (priority: string) => string;
  priorityColors: {
    low: string;
    medium: string;
    high: string;
  };
  userRole: string;
  orderAgencyId: string;
  updateSubtask: UseMutationResult<
    null | undefined,
    Error,
    {
      subtaskId: string;
      subtask: Subtask.Type;
    },
    unknown
  >;
}) => {
  const [content, setContent] = useState(subtask.content);
  return (
    <div
      className="flex items-center justify-between py-3"
      onMouseEnter={() => onHover(subtask.id)}
      onMouseLeave={() => onHover('')}
      {...props}
    >
      {isEditing ? (
        <div className='flex items-center'>
          <input
            type="text"
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            onBlur={() =>
              handleSaveTaskName(subtask.id, subtask, newSubtaskName)
            }
            onKeyDown={(e) =>
              handleKeyDown(e, subtask.id, subtask, newSubtaskName)
            }
            className="w-full rounded-md border-none bg-transparent font-semibold text-gray-900 focus:outline-none"
            autoFocus
          />
          <X
            className="ml-2 h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => (isEditing = false)}
          />
        </div>
      ) : (
        <p
          className="mr-4 max-w-[calc(100%-40px)] overflow-hidden truncate text-ellipsis font-semibold text-gray-900"
          onClick={onEdit}
        >
          {subtask.name}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            {isHovered && (
              <Button className="mr-4 bg-gray-200 text-gray-500 hover:bg-slate-200">
                {t('tasks.openSubtask')}
              </Button>
            )}
          </SheetTrigger>
          <SheetContent className="max-w-[300px] sm:max-w-[700px]">
            <SheetHeader>
              <div className="flex justify-between">
                <SheetTitle>
                  {isEditing ? (
                    <input
                      type="text"
                      value={newSubtaskName}
                      onChange={(e) => setNewSubtaskName(e.target.value)}
                      onBlur={() =>
                        handleSaveTaskName(subtask.id, subtask, newSubtaskName)
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, subtask.id, subtask, newSubtaskName)
                      }
                      className="w-full rounded-md border-none bg-transparent text-xl font-semibold text-gray-900 focus:outline-none"
                    />
                  ) : (
                    <div className="mr-2 flex w-full items-center justify-between">
                      <p
                        className="flex-grow text-xl font-semibold text-gray-900"
                        onClick={onEdit}
                      >
                        {subtask.name}
                      </p>
                    </div>
                  )}
                </SheetTitle>
                <SheetClose className="absolute right-0 top-0 mr-4 mt-4">
                  <X className="h-4 w-4" />
                </SheetClose>
              </div>
            </SheetHeader>

            <Tabs defaultValue="notes" className="mt-6">
              <TabsList className="flex w-fit gap-2 bg-transparent mb-7">
                <ThemedTabTrigger value="notes" activeTab="notes" option="notes">
                  Notes
                </ThemedTabTrigger>
                <ThemedTabTrigger value="details" activeTab="details" option="details">
                  Details
                </ThemedTabTrigger>
                <ThemedTabTrigger value="time" activeTab="time" option="time">
                  Time
                </ThemedTabTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex text-sm font-semibold">
                      <CalendarIcon className="mr-2 h-4 w-4" /> {t('details.deadline')}
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
                      handlePeriod={handleDateRangeChange}
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
                    <span className="flex gap-[0.20rem] text-sm font-semibold">
                      <FlagIcon className="mr-2 h-4 w-4" />
                      <p>{t('details.priority')}</p>
                    </span>
                    <PriorityCombobox mode={'subtask'} subtask={subtask} />
                  </div>
                  <SubtaskAssignations
                    onUserSelectionChange={(selectedUsers) =>
                      handleAssignedToChange(selectedUsers)
                    }
                    searchUserOptions={searchUserOptions}
                    subtaskId={subtask.id}
                    userRole={userRole}
                  />
                  <SubtaskFollowers
                    onUserSelectionChange={(selectedUsers) =>
                      handleFollowersChange(selectedUsers)
                    }
                    searchUserOptions={searchUserOptionsFollowers}
                    subtaskId={subtask.id}
                    userRole={userRole}
                  />
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <div className="h-full">
                  <RichTextEditorV2
                    content={content ?? ''}
                    onChange={setContent}
                    onBlur={() => handleContentChange(content ?? '')}
                    userRole={userRole}
                    hideSubmitButton={true}
                    showToolbar={true}
                    isEditable={true}
                  />
                </div>
              </TabsContent>

              <TabsContent value="time" className="mt-4">
                <SubtaskTimers subtaskId={subtask.id} userRole={userRole} />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>

        <StatusCombobox
          subtask={subtask}
          agency_id={orderAgencyId}
          mode="subtask"
        />

        <PriorityCombobox mode={'subtask'} subtask={subtask} />

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
        <div className="flex items-center">
          <TimeTracker
            elementId={subtask.id}
            elementType="subtask"
            elementName={subtask.name ?? ''}
            isHovered={isHovered}
          />
          <TrashIcon
            className={`h-4 w-4 cursor-pointer ${isHovered ? 'text-gray-500 hover:text-red-500' : 'text-transparent'}`}
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
  );
};

export default SubtaskItem;
