import { useState } from 'react';
import React from 'react';

import { UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, FlagIcon, Loader, PanelRightOpen, TrashIcon, X } from 'lucide-react';

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
import { createTimer } from '~/team-accounts/src/server/actions/timers/create/create-timer';
import { TimerUpdate } from '~/lib/timer.types';
import { updateActiveTimer } from '~/team-accounts/src/server/actions/timers/update/update-timer';
import { getFormattedDateRange } from '../../utils/get-formatted-dates';
import { useTranslation } from 'react-i18next';

const SubtaskItem = ({
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
  currentUserId,
  ...props
}: {
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
  currentUserId: string;
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'details' | 'time'>('notes');
  const { t, i18n } = useTranslation(['tasks','orders']);
  const language = i18n.language;
  const [content, setContent] = useState(subtask.content);
  const enabledUserRole = new Set(['agency_owner', 'agency_member', 'agency_project_manager'])
  const queryClient = useQueryClient();
  const handleUpdate = async (timerId: string, timer: TimerUpdate) => {
    await updateActiveTimer(timerId, timer);

    queryClient.invalidateQueries({
      queryKey: ['subtask_timers', timer.id]
    }).catch((error) => {
      console.error('Error invalidating subtask timers:', error);
    });
  };
  const canEditSubtask = (userRole: string) => {
    if (['agency_owner', 'agency_member', 'agency_project_manager'].includes(userRole)) {
      return true;
    }
    
    return false;
  };
  const isEditable = canEditSubtask(userRole);
  
  return (
    <div
      className="flex items-center justify-between py-3 overflow-x-auto"
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
            className="w-full rounded-md border-none bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
            autoFocus
            disabled={!isEditable}
          />
          <X
            className="ml-2 h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => (isEditing = false)}
          />
        </div>
      ) : (
        <p
          className={`mr-4 max-w-[calc(100%-40px)] overflow-hidden truncate text-sm font-medium text-gray-900 ${
            isEditable ? 'cursor-pointer' : 'cursor-default'
          }`}
          onClick={isEditable ? onEdit : undefined}
        >
          {subtask.name}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            {isHovered && (
            <Button variant="outline" className="p-1 text-xs bg-transparent hover:bg-white">
            <PanelRightOpen className='p-1' /> {t('tasks.openSubtask')}
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
                      className="w-full rounded-md border-none bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
                    />
                  ) : (
                    <div className="mr-2 flex w-full items-center justify-between">
                      <p
                        className="flex-grow text-sm font-medium text-gray-900"
                        onClick={isEditable ? onEdit : undefined}
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

            <Tabs 
              defaultValue={activeTab} 
              className="mt-6"
              onValueChange={(value: string) => {
                setActiveTab(value as 'notes' | 'details' | 'time');
              }}
            >
              <TabsList className="flex w-fit gap-2 bg-transparent mb-7">
                <ThemedTabTrigger value="notes" activeTab={activeTab} option="notes">
                  {t('notesTitle')}
                </ThemedTabTrigger>
                <ThemedTabTrigger value="details" activeTab={activeTab} option="details">
                  {t('detailsTitle')}
                </ThemedTabTrigger>
                <ThemedTabTrigger value="time" activeTab={activeTab} option="time">
                  {t('timeTitle')}
                </ThemedTabTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex text-sm font-medium">
                      <CalendarIcon className="mr-2 h-4 w-4" /> {t('details.deadline')}
                    </span>
                    {isEditable ? (
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
                    ) : (
                      <p 
                        className='whitespace-nowrap select-none px-3 text-gray-900 font-medium text-sm'
                      >
                        {getFormattedDateRange(subtask.start_date && subtask.end_date
                          ? {
                              from: new Date(subtask.start_date),
                              to: new Date(subtask.end_date),
                            }
                          : undefined, language, true) || t('empty_date_range',{ns: 'orders'})}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex text-sm font-medium">
                      <Loader className="mr-2 h-4 w-4" />
                      <p>{t('details.status')}</p>
                    </span>
                    <StatusCombobox
                      subtask={subtask}
                      agency_id={orderAgencyId}
                      mode="subtask"
                      blocked={!isEditable} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex gap-[0.20rem] text-sm font-medium">
                      <FlagIcon className="mr-2 h-4 w-4" />
                      <p>{t('details.priority')}</p>
                    </span>
                    <PriorityCombobox 
                      mode={'subtask'} 
                      subtask={subtask} 
                      blocked={!isEditable} 
                    />
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
                    isEditable={isEditable}
                    referenceId={subtask.id}
                  />
                </div>
              </TabsContent>

              <TabsContent value="time" className="mt-4">
                <SubtaskTimers subtaskId={subtask.id} userRole={userRole} onCreate={createTimer} onUpdate={handleUpdate}/>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>

        <StatusCombobox
          subtask={subtask}
          agency_id={orderAgencyId}
          mode="subtask"
          blocked={!isEditable}
        />

        <PriorityCombobox mode={'subtask'} subtask={subtask} blocked={!isEditable} />

        {isEditable ? (
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
        ) : (
          <p 
            className='whitespace-nowrap select-none  text-gray-900 font-medium text-sm'
          >
            {getFormattedDateRange(subtask.start_date && subtask.end_date
              ? {
                  from: new Date(subtask.start_date),
                  to: new Date(subtask.end_date),
                }
              : undefined, language, true) || t('empty_date_range',{ns: 'orders'})}
          </p>
        )}
        <div className="flex gap-2 min-w-[40px]">
          {
            enabledUserRole.has(userRole)  && (
              <TimeTracker
                elementId={subtask.id}
                elementType="subtask"
                elementName={subtask.name ?? ''}
                isHovered={isHovered}
              />
            )
          }
          {isEditable && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtaskItem;