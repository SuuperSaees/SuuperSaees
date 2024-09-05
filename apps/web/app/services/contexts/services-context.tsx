'use client';

import { Service } from '../../../lib/services.types';
import { getServicesByOrganizationId } from '../../../../../packages/features/team-accounts/src/server/actions/services/get/get-services-by-organization-id';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ServicesContextValue {
  services: Service.Type[];
  loading: boolean;
  error: boolean;
  updateServices: (showLoader:boolean) => Promise<void>;
}

const ServicesContext = createContext<ServicesContextValue | undefined>(undefined);

interface ServicesContextProviderProps {
  children: ReactNode;
}

export const ServicesContextProvider: React.FC<ServicesContextProviderProps> = ({ children }) => {
  const [services, setServices] = useState<Service.Type[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const updateServices = async (showLoader:boolean): Promise<void> => {
    setLoading(showLoader);
    setError(false);
    try {
      const result = await getServicesByOrganizationId();
      setServices(result.products);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const value: ServicesContextValue = {
    services,
    loading,
    error,
    updateServices,
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServicesContext = (): ServicesContextValue => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServicesContext must be used within a ServicesContextProvider');
  }
  return context;
};

export default ServicesContext;