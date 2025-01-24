'use client';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';
import { Tags } from '~/lib/tags.types';
import { User } from '~/lib/user.types';

interface AgencyStatusesContextType {
  statuses: AgencyStatus.Type[];
  setStatuses: (statuses: AgencyStatus.Type[]) => void;
  updateStatuses: (updatedStatus: AgencyStatus.Type) => void;
  tags: Tags.Type[];
  setTags: (tags: Tags.Type[]) => void;
  agencyMembers?: User.Response[];
}

const AgencyStatusesContext = createContext<AgencyStatusesContextType | undefined>(undefined);

export function AgencyStatusesProvider({ children, initialStatuses, initialTags, agencyId, agencyMembers }: { 
    children: React.ReactNode;
    initialStatuses?: AgencyStatus.Type[];
    initialTags?: Tags.Type[];
    agencyId?: string;
    agencyMembers?: User.Response[];
  }) {
    const [statuses, setStatuses] = useState<AgencyStatus.Type[]>(initialStatuses ?? []);
    const [tags, setTags] = useState<Tags.Type[]>(initialTags ?? []);

    const updateStatuses = useCallback((updatedStatus: AgencyStatus.Type) => {
      setStatuses(prevStatuses => {
        return prevStatuses.map(status => 
          status.id === updatedStatus.id 
            ? updatedStatus 
            : status
        );
      });
    }, []);
  
    const value = useMemo(() => ({
      statuses,
      agencyMembers,
      tags,
      setTags,
      setStatuses,
      updateStatuses,
    }), [statuses, updateStatuses, tags, setTags, agencyMembers]);
    
    const { data: fetchedStatuses } = useQuery({
        queryKey: ['agencyStatuses'],
        queryFn: () => getAgencyStatuses(agencyId ?? ''),
        enabled: !initialStatuses, 
      });
    
      useEffect(() => {
        if (!initialStatuses && fetchedStatuses) {
          setStatuses(fetchedStatuses);
        }
      }, [fetchedStatuses, initialStatuses]);
  
    return (
      <AgencyStatusesContext.Provider value={value}>
        {children}
      </AgencyStatusesContext.Provider>
    );
  }

export function useAgencyStatuses() {
  const context = useContext(AgencyStatusesContext);
  if (context === undefined) {
    throw new Error('useAgencyStatuses must be used within a StatusProvider');
  }
  return context;
}