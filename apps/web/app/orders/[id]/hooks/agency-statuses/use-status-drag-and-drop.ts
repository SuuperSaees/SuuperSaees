import { useState } from 'react';

import {
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { updateStatusesPositions } from '~/team-accounts/src/server/actions/statuses/update/update-agency-status';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { updateCache } from '~/utils/handle-caching';

export const CACHE_KEY = 'agencyStatuses';
export const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useStatusDragAndDrop = (
  agencyStatuses: AgencyStatus.Type[],
  agency_id: string
) => {


  const [statuses, setStatuses] = useState(agencyStatuses);
  const queryClient = useQueryClient();

  const updateStatusesPositionsMutation = useMutation({
    mutationFn: async ({ statuses }: { statuses: AgencyStatus.Type[] }) => {
      return await updateStatusesPositions(statuses,agency_id);
    },
    onSuccess: (updatedStatuses) => {
      if (updatedStatuses) {
        updateCache(
          `${CACHE_KEY}_${agency_id}`,
          updatedStatuses,
          queryClient,
          ['agencyStatuses', agency_id],
          CACHE_EXPIRY
        );
        // toast.success('Successfully updated status positions');
      }
    },
    onError: () => {
      toast.error('Error updating status positions');
    },
  });

  useEffect(() => {
    setStatuses(agencyStatuses);
  }, [agencyStatuses]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor,{
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    let newStatuses = statuses

    if (active.id !== over?.id) {
      setStatuses((items) => {
        const oldIndex = items?.findIndex((item) => item.id === active.id)
        const newIndex = items?.findIndex((item) => item.id === over?.id)
        newStatuses = arrayMove(items, oldIndex, newIndex)
        return newStatuses
      })
      await updateStatusesPositionsMutation.mutateAsync({
        statuses: newStatuses,
      });
    }
  }

  return {
    sensors,
    handleDragEnd,
    statuses,
    CACHE_KEY,
    CACHE_EXPIRY,
  };
};
