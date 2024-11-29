import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

interface AgencyStatusesContextType {
  statuses: AgencyStatus.Type[];
  setStatuses: (statuses: AgencyStatus.Type[]) => void;
  updateStatuses: (updatedStatus: AgencyStatus.Type) => void;
}

const AgencyStatusesContext = createContext<AgencyStatusesContextType | undefined>(undefined);

export function AgencyStatusesProvider({ children, initialStatuses, agencyId }: { 
    children: React.ReactNode;
    initialStatuses?: AgencyStatus.Type[];
    agencyId?: string;
  }) {
    const [statuses, setStatuses] = useState<AgencyStatus.Type[]>(initialStatuses ?? []);
  
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
      setStatuses,
      updateStatuses
    }), [statuses, updateStatuses]);
    
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