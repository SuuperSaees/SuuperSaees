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
  brandThemeColor?: OrganizationSettingValue | null;
  updateBrandColorTheme: UseMutationResult<
    {
      account_id: string;
      created_at: string;
      id: string;
      key: OrganizationSettingKeys;
      updated_at: string | null;
      value: string;
    },
    Error,
    {
      key: OrganizationSettingKeys;
      value: string;
    },
    unknown
  >;
  backgroundColor?: OrganizationSettingValue | null;
  logoUrl?: OrganizationSettingValue | null;
  timezone?: OrganizationSettingValue | null;
  language?: OrganizationSettingValue | null;
  dateFormat?: OrganizationSettingValue | null;
};

// Create context with initial value as undefined, to be properly set in the provider
export const OrganizationSettingsContext = createContext<
  OrganizationSettingsContextType | undefined
>(undefined);

// Function to validate a hex color string
const isValidHexColor = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

export const OrganizationSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // State to store the theme color for the brand
  const [brandColorTheme, setBrandColorTheme] = useState<string | null>(null);

  // Query to fetch organization settings from the server
  const organizationSettings = useQuery({
    queryKey: ['organizationSettings'],
    queryFn: async () => getOrganizationSettings(),
  });

  const updateBrandColorTheme = useMutation({
    mutationFn: async (organizationSetting: {
      key: OrganizationSettingKeys;
      value: string;
    }) => await upsertOrganizationSettings(organizationSetting),

    onSuccess: (colorTheme) => {
      console.log('colorTheme', colorTheme);
      const newColor = isValidHexColor(colorTheme.value)
        ? colorTheme.value
        : null;
      updateLocalStorage(newColor); // Update localStorage
      setBrandColorTheme(newColor); // Update state
      toast.success('Success', {
        description: 'Organization color updated',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The organization color could not be updated',
      });
    },
  });

  // Function to update localStorage with the new theme color
  const updateLocalStorage = (newColor: string | null) => {
    const prevSettings = JSON.parse(
      localStorage.getItem('organizationSettings') ?? 'null',
    ) as OrganizationSettingsContextType;
    localStorage.setItem(
      'organizationSettings',
      JSON.stringify({
        ...prevSettings,
        brandThemeColor: newColor,
      }),
    );
  };

  // Effect to load theme color from localStorage on component mount
  useEffect(() => {
    const organizationSettings = JSON.parse(
      localStorage.getItem('organizationSettings') ?? 'null',
    ) as OrganizationSettingsContextType;
    if (
      organizationSettings &&
      isValidHexColor(organizationSettings.brandThemeColor ?? '')
    ) {
      setBrandColorTheme(organizationSettings.brandThemeColor ?? null);
    }
  }, []);

  // Effect to update localStorage and state when fetched data changes
  useEffect(() => {
    const organizationSettingsData = organizationSettings.data;

    if (
      organizationSettingsData &&
      organizationSettingsData.key === 'theme_color'
    ) {
      const newColor = isValidHexColor(organizationSettingsData.value)
        ? organizationSettingsData.value
        : null;
      setBrandColorTheme(newColor);
      updateLocalStorage(newColor);
    }
  }, [organizationSettings.data]);

  // Provide the context to children components
  return (
    <OrganizationSettingsContext.Provider
      value={{
        brandThemeColor: brandColorTheme,
        updateBrandColorTheme,
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