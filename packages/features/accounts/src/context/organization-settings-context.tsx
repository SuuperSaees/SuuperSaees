'use client';

import { createContext, useContext, useState } from 'react';



import { UseMutationResult, useMutation // useQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';


import { Database } from '../../../../../apps/web/lib/database.types';
// import { getOrganizationSettings } from '../../../team-accounts/src/server/actions/organizations/get/get-organizations';
import { upsertOrganizationSettings } from '../../../team-accounts/src/server/actions/organizations/update/update-organizations';
import { useTranslation } from 'react-i18next';
import { handleResponse } from '../../../../../apps/web/lib/response/handle-response';

export type OrganizationSettingKeys =
  | Database['public']['Enums']['organization_setting_key'];
  

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

// Function to map initialSettings (fetched data) to key-value format
const mapInitialSettingsToKeyValue = (
  initialSettings: {
    organization_id: string;
    created_at: string;
    id: string;
    key: OrganizationSettingKeys;
    updated_at: string | null;
    value: string;
  }[],
): OrganizationSettingsContextType => {
  return initialSettings.reduce((acc, setting) => {
    // Ensure unique keys
    if (!acc[setting.key]) {
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {} as OrganizationSettingsContextType);
};

const OrganizationSettingsProvider = ({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: {
    organization_id: string;
    created_at: string;
    id: string;
    key: OrganizationSettingKeys;
    updated_at: string | null;
    value: string;
  }[];
}) => {
  // Transform initialSettings from array to key-value format
  const mappedSettings = mapInitialSettingsToKeyValue(initialSettings);
  const { t } = useTranslation('responses');
  // State to store organization settings initialized with transformed settings
  const [organizationSettings, setOrganizationSettings] =
    useState<OrganizationSettingsContextType>(mappedSettings);

  // Mutation to update a single setting
  const updateOrganizationSetting = useMutation({
    mutationFn: async (organizationSetting: {
      key: OrganizationSettingKeys;
      value: string;
    }) =>  {
      const rest = await upsertOrganizationSettings(organizationSetting)
      await handleResponse(rest, 'organizations', t);
      if(rest.ok && rest.success?.data){
        const { key, value } = rest.success.data;
        // Update only if valid color when it's the theme color
        const newValue =
          key === 'theme_color' && !isValidHexColor(value) ? '' : value;

        setOrganizationSettings((prev) => ({
          ...prev,
          [key]: newValue,
        }));
        return rest.success.data;
      }
      throw new Error('Failed to update organization setting');
    },

    // onSuccess: (updatedSetting) => {
    //   // console.log('Updated Setting', updatedSetting);
    //   const { key, value } = updatedSetting;

    //   // Update only if valid color when it's the theme color
    //   const newValue =
    //     key === 'theme_color' && !isValidHexColor(value) ? '' : value;

    //   setOrganizationSettings((prev) => ({
    //     ...prev,
    //     [key]: newValue,
    //   }));
    // },
    
    onError: () => {
      console.error('Error updating organization setting');
    },
  });

  // Function to reset a specific setting to its default value (empty string)
  const resetOrganizationSetting = (key: OrganizationSettingKeys) => {
    const defaultValue = ''; // Default value for all settings

    // Update state
    updateOrganizationSetting.mutate({ key, value: defaultValue });
    setOrganizationSettings((prev) => ({
      ...prev,
      [key]: defaultValue,
    }));
    toast.success('Reset Success', {
      description: `Organization setting has been reset to default.`,
    });
  };

  // Provide the context to children components
  // console.log('organizationSettingsR', organizationSettings);
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