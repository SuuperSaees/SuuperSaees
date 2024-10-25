import { useEffect, useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { DateRange } from '@kit/ui/calendar';

import { Subtask } from '~/lib/tasks.types';

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

  useEffect(() => {
    const handleSubtaskChange = (payload: any) => {
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
      channel.unsubscribe();
    };
  }, [subtask.id]);

  useEffect(() => {
    if (subtask.deleted_on) {
      setIsDeleted(true);
    }
  }, [subtask.deleted_on]);

  const updateSubtask = async (updates: Partial<SubtaskType>) => {
    if (updates.state === 'completed') {
      updates.completed = true;
    } else {
      updates.completed = false;
    }

    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', subtask.id)
      .select('*');

    if (error) {
      console.error('Error updating subtask:', error);
      return;
    }
    if (data && data.length > 0) {
      setSubtask((prev) => ({ ...prev, ...data[0] }));
    } else {
      console.warn('No data returned on update for subtask');
    }
  };

  const createSubtask = async (newSubtask: Omit<SubtaskType, 'id'>) => {
    const { data, error } = await supabase
      .from('subtasks')
      .insert([newSubtask])
      .select('*');

    if (error) {
      console.error('Error creating subtask:', error);
      return;
    }
    if (data && data.length > 0) {
      setSubtask((prev) => ({ ...prev, ...data[0] }));
    } else {
      console.warn('No data returned on create for subtask');
    }
  };

  const handleStatusChange = (value: string) => {
    if (
      ['completed', 'in_progress', 'in_review', 'pending', 'annulled'].includes(
        value,
      )
    ) {
      setSelectedStatus(value);
      updateSubtask({
        state: value as
          | 'completed'
          | 'in_progress'
          | 'in_review'
          | 'pending'
          | 'annulled',
      }).catch((error) => {
        console.error('Error updating subtask status:', error);
      });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (['high', 'medium', 'low'].includes(value)) {
      setSelectedPriority(value);
      updateSubtask({ priority: value as 'high' | 'medium' | 'low' }).catch(
        (error) => {
          console.error('Error updating subtask priority:', error);
        },
      );
    }
  };

  const handleNameChange = () => {
    updateSubtask({ name }).catch((error) => {
      console.error('Error updating subtask name:', error);
    });
  };

  const handleContentChange = () => {
    updateSubtask({ content }).catch((error) => {
      console.error('Error updating subtask content:', error);
    });
  };

  const handleDateRangeChange = (newPeriod: DateRange) => {
    setSelectedPeriod(newPeriod);
    updateSubtask({
      start_date: newPeriod?.from ? newPeriod?.from.toDateString() : null,
      end_date: newPeriod?.to ? newPeriod?.to.toDateString() : null,
    }).catch((error) => {
      console.error('Error updating subtask date range:', error);
    });
  };

  const handleDeleteSubtask = () => {
    updateSubtask({ deleted_on: new Date().toISOString() }).catch((error) => {
      console.error('Error deleting subtask:', error);
    });
  };

  return {
    subtask,
    updateSubtask,
    createSubtask,
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
