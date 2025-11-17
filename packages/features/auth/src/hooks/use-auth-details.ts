'use client';

import { useEffect, useState } from 'react';

export interface AuthDetails {
  logo_url: string;
  theme_color: string;
  background_color: string;
  favicon_url: string;
  auth_card_background_color: string;
  auth_section_background_color: string;
  logo_dark_url: string;
  sidebar_background_color: string;
  auth_background_url?: string;
  portal_name: string;
  organization_id?: string;
}

export const useAuthDetails = (hostname: string) => {
  const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Since we're not using multitenancy, we don't need to fetch domain-specific settings
    // Just set loading to false immediately
    setIsLoading(false);
    setAuthDetails(null);
    setOrganizationId(undefined);
  }, [hostname]);

  return { authDetails, organizationId, isLoading };
};
