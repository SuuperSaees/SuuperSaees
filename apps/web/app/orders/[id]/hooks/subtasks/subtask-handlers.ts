import { Subtask } from '~/lib/tasks.types';
import { DateRange } from '@kit/ui/calendar';
import { UseMutationResult } from '@tanstack/react-query';

export const createHandlers = (
  updateSubtask: UseMutationResult<null | undefined, Error, {
    subtaskId: string;
    subtask: Subtask.Type;
}, unknown>,
  createSubtask: UseMutationResult<undefined, Error, {
    newSubtask: Omit<Subtask.Type, "id">;
}, unknown>,
  setEditingSubtaskId: (id: string | null) => void,
  setNewSubtaskName: (name: string) => void,
  changeAgencyMembersAssigned: UseMutationResult<{
    subtaskId: string;
}, Error, {
    agencyMemberIds: string[];
    subtaskId: string;
}, unknown>,
  changeAgencyMembersFollowers: UseMutationResult<{
    subtaskId: string;
}, Error, {
    followers: string[];
    subtaskId: string;
}, unknown>,
  t: (key: string) => string
) => {
    const handleAddSubtask = async (taskId: string) => {
    const newSubtask = {
      completed: false,
      name: t('tasks.newSubtask'),
      parent_task_id: taskId,
      deleted_on: null,
      created_at: new Date().toISOString(),
      priority: 'low' as 'low' | 'high' | 'medium' | null,
      content: null,
      end_date: null,
      start_date: null,
      state: 'pending',
      position: null,
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
    newSubtaskName: string,
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
    newSubtaskName: string,
  ) => {
    if (e.key === 'Enter') {
      await handleSaveTaskName(subtaskId, subtask, newSubtaskName);
    } else if (e.key === 'Escape') {
      setEditingSubtaskId(null);
      setNewSubtaskName('');
    }
  };

  const handleUpdateAssignedTo = async (
    subtaskId: string,
    assignedTo: string[],
  ) => {
    await changeAgencyMembersAssigned.mutateAsync({
      agencyMemberIds: assignedTo,
      subtaskId,
    });
  };

  const handleUpdateFollowers = async (
    subtaskId: string,
    followers: string[],
  ) => {
    await changeAgencyMembersFollowers.mutateAsync({
      followers: followers,
      subtaskId,
    });
  };

  return {
    handleAddSubtask,
    handleStartEditing,
    handleSaveTaskName,
    handleStatusChange,
    handlePriorityChange,
    handleDateRangeChange,
    handleContentChange,
    handleKeyDown,
    handleUpdateAssignedTo,
    handleUpdateFollowers,
  };
};