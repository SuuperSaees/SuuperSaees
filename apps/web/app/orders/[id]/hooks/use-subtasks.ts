import { useEffect, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { DateRange } from '@kit/ui/calendar';

import { Subtask } from '~/lib/tasks.types';
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';

type SubtaskType = Subtask.Type;

export const useRealTimeSubtasks = (initialSubtask: SubtaskType) => {
  const supabase = useSupabase();
  const [subtask, setSubtask] = useState<SubtaskType>(initialSubtask);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    subtask.state ?? 'pending',
  );
  const [selectedPriority, setSelectedPriority] = useState<string>(
    subtask.priority ?? 'low',
  );
  const [name, setName] = useState<string>(subtask.name ?? '');
  const [content, setContent] = useState<string>(subtask.content ?? '');
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>({
    from: new Date(subtask.start_date ?? Date.now()),
    to: new Date(subtask.end_date ?? Date.now()),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleSubtaskChange = (payload: {
      eventType: string;
      new: SubtaskType;
      old: SubtaskType;
    }) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;

      if (eventType === 'UPDATE' && newSubtask.id === subtask.id) {
        if (newSubtask.deleted_on) {
          setIsDeleted(true);
        } else {
          setSubtask((prev) => ({ ...prev, ...newSubtask }));
        }
      } else if (eventType === 'DELETE' && oldSubtask.id === subtask.id) {
        setIsDeleted(true);
      }
    };

    const channel = supabase
      .channel('subtasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        handleSubtaskChange,
      )
      .subscribe();

    return () => {
      channel.unsubscribe().catch((error) => console.error(error));
    };
  }, [subtask.id]);

  useEffect(() => {
    if (subtask.deleted_on) {
      setIsDeleted(true);
    }
  }, [subtask.deleted_on]);

  const updateSubtask = useMutation({
    mutationFn: async (updates: Partial<SubtaskType>) =>
      updateSubtaskById(subtask.id, updates),
    onSuccess: async () => {
      toast.success('Successfully updated task');
      await queryClient.invalidateQueries({
        queryKey: ['subtasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Failed to update task name');
    },
  });

  const handleStatusChange = async (value: string) => {
    if (
      ['completed', 'in_progress', 'in_review', 'pending', 'annulled'].includes(
        value,
      )
    ) {
      setSelectedStatus(value);
      await updateSubtask.mutateAsync({
        state: value as
          | 'completed'
          | 'in_progress'
          | 'in_review'
          | 'pending'
          | 'annulled',
        completed: value === 'completed' ? true : false,
      });
    }
  };

  const handlePriorityChange = async (value: string) => {
    if (['high', 'medium', 'low'].includes(value)) {
      setSelectedPriority(value);
      await updateSubtask.mutateAsync({
        priority: value as 'high' | 'medium' | 'low',
      });
    }
  };

  const handleNameChange = async () => {
    await updateSubtask.mutateAsync({ name });
  };

  const handleContentChange = async () => {
    await updateSubtask.mutateAsync({ content });
  };

  const handleDateRangeChange = async (newPeriod: DateRange) => {
    setSelectedPeriod(newPeriod);
    await updateSubtask.mutateAsync({
      start_date: newPeriod?.from ? newPeriod?.from.toISOString() : null,
      end_date: newPeriod?.to ? newPeriod?.to.toISOString() : null,
    });
  };

  const handleDeleteSubtask = async () => {
    await updateSubtask.mutateAsync({ deleted_on: new Date().toISOString() });
  };

  return {
    subtask,
    updateSubtask,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    name,
    setName,
    content,
    setContent,
    selectedPeriod,
    setSelectedPeriod,
    handleStatusChange,
    handlePriorityChange,
    handleNameChange,
    handleDateRangeChange,
    handleContentChange,
    handleDeleteSubtask,
    isDeleted,
  };
};
