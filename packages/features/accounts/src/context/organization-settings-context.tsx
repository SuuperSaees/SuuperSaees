'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import {
  UseMutationResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { Database } from '../../../../../apps/web/lib/database.types';
import { getOrganizationSettings } from '../../../team-accounts/src/server/actions/organizations/get/get-organizations';
import { upsertOrganizationSettings } from '../../../team-accounts/src/server/actions/organizations/update/update-organizations';

export type OrganizationSettingKeys =
  Database['public']['Enums']['organization_setting_key'];

export type OrganizationSettingValue =
  Database['public']['Tables']['organization_settings']['Row']['value'];

export type OrganizationSettingsContextType = {
  [key in OrganizationSettingKeys]?: OrganizationSettingValue;
} & {
  updateOrganizationSetting: UseMutationResult<
    Database['public']['Tables']['organization_settings']['Row'],
    Error,
    {
      key: OrganizationSettingKeys;
      value: string;
    },
    unknown
  >;
  resetOrganizationSetting: (key: OrganizationSettingKeys) => void; // Add reset function type
};

// Create context with initial value as undefined, to be properly set in the provider
export const OrganizationSettingsContext = createContext<
  OrganizationSettingsContextType | undefined
>(undefined);

// Function to validate a hex color string
const isValidHexColor = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

const OrganizationSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // State to store organization settings
  const [organizationSettings, setOrganizationSettings] =
    useState<OrganizationSettingsContextType>(
      JSON.parse(localStorage.getItem('organizationSettings') ?? '{}'),
    );

  // Query to fetch organization settings from the server
  const { data: fetchedSettings } = useQuery({
    queryKey: ['organizationSettings'],
    queryFn: async () => getOrganizationSettings(),
  });

  // Mutation to update a single setting
  const updateOrganizationSetting = useMutation({
    mutationFn: async (organizationSetting: {
      key: OrganizationSettingKeys;
      value: string;
    }) => await upsertOrganizationSettings(organizationSetting),

    onSuccess: (updatedSetting) => {
      console.log('Updated Setting', updatedSetting);
      const { key, value } = updatedSetting;

      // Update only if valid color when it's the theme color
      const newValue =
        key === 'theme_color' && !isValidHexColor(value) ? '' : value;

      updateLocalStorage(key, newValue);
      setOrganizationSettings((prev) => ({
        ...prev,
        [key]: newValue,
      }));

      toast.success('Success', {
        description: `Organization setting updated`,
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The organization setting could not be updated',
      });
    },
  });

  // Function to update localStorage with the new setting
  const updateLocalStorage = (
    key: OrganizationSettingKeys,
    value: OrganizationSettingValue,
  ) => {
    const prevSettings = JSON.parse(
      localStorage?.getItem('organizationSettings') ?? '{}',
    );
    localStorage?.setItem(
      'organizationSettings',
      JSON.stringify({
        ...prevSettings,
        [key]: value,
      }),
    );
  };

  // Function to reset a specific setting to its default value (empty string)
  const resetOrganizationSetting = (key: OrganizationSettingKeys) => {
    const defaultValue = ''; // Default value for all settings

    // Update local storage and state
    updateOrganizationSetting.mutate({ key, value: defaultValue });

    updateLocalStorage(key, defaultValue);
    setOrganizationSettings((prev) => ({
      ...prev,
      [key]: defaultValue,
    }));
    toast.success('Reset Success', {
      description: `Organization setting has been reset to default.`,
    });
  };

  // Effect to load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSettings = JSON.parse(
        localStorage?.getItem('organizationSettings') ?? '{}',
      );
      setOrganizationSettings(storedSettings);
    }
  }, []);

  // Effect to update state and localStorage when fetched data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (fetchedSettings) {
        fetchedSettings.forEach(({ key, value }) => {
          const newValue =
            key === 'theme_color' && !isValidHexColor(value) ? '' : value;
          setOrganizationSettings((prev) => ({
            ...prev,
            [key]: newValue,
          }));
          updateLocalStorage(key, newValue);
        });
      }
    }
  }, [fetchedSettings]);

  if (!localStorage) return null;

  // Provide the context to children components
  return (
    <OrganizationSettingsContext.Provider
      value={{
        ...organizationSettings,
        updateOrganizationSetting,
        resetOrganizationSetting, // Provide the reset function to the context
      }}
    >
      {children}
    </OrganizationSettingsContext.Provider>
  );
};

// Hook to use the OrganizationSettings context in child components
export const useOrganizationSettings = () => {
  const context = useContext(OrganizationSettingsContext);
  if (!context) {
    throw new Error(
      'useOrganizationSettings must be used within an OrganizationSettingsProvider',
    );
  }
  return context;
};

export default OrganizationSettingsProvider;