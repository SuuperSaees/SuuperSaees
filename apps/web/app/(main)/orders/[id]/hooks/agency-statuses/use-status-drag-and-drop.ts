import { useState } from 'react';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import {
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgencyStatuses } from 'node_modules/@kit/team-accounts/src/server/actions/statuses/get/get-agency-statuses';
import { toast } from 'sonner';

import { AgencyStatus } from '~/lib/agency-statuses.types';
import { updateStatusesPositions } from '~/team-accounts/src/server/actions/statuses/update/update-agency-status';
import { updateCache } from '~/utils/handle-caching';

import { useAgencyStatuses } from '../../../components/context/agency-statuses-context';

export const CACHE_KEY = 'agencyStatuses';
export const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useStatusDragAndDrop = (
  agencyStatuses: AgencyStatus.Type[],
  agency_id: string,
) => {
  const [statuses, setStatuses] = useState(agencyStatuses);
  const queryClient = useQueryClient();
  const router = useRouter();
  const updateStatusesPositionsMutation = useMutation({
    mutationFn: async ({ statuses }: { statuses: AgencyStatus.Type[] }) => {
      return await updateStatusesPositions(statuses, agency_id);
    },
    onSuccess: (updatedStatuses) => {
      if (updatedStatuses) {
        updateCache(updatedStatuses, queryClient, [
          'agencyStatuses',
          agency_id,
        ]);
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
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const { setStatuses: setStatusesContext } = useAgencyStatuses();

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    let newStatuses = statuses;

    if (active.id !== over?.id) {
      setStatuses((items) => {
        const oldIndex = items?.findIndex((item) => item.id === active.id);
        const newIndex = items?.findIndex((item) => item.id === over?.id);
        newStatuses = arrayMove(items, oldIndex, newIndex);
        setStatusesContext(newStatuses);
        return newStatuses;
      });
      await updateStatusesPositionsMutation.mutateAsync({
        statuses: newStatuses,
      });
      router.refresh();
    }
  }

  async function getStatuses() {
    const statuses = await getAgencyStatuses(agency_id);
    setStatuses(statuses ?? []);
  }

  return {
    sensors,
    setStatuses,
    handleDragEnd,
    statuses,
    CACHE_KEY,
    CACHE_EXPIRY,
    getStatuses,
  };
};