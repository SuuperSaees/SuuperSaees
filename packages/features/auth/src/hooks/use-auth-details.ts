'use client';

import { useEffect, useState } from 'react';

import { getFullDomainBySubdomain } from '../../../../multitenancy/utils/get/get-domain';

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
  organization_id?: string;
}

export const useAuthDetails = (hostname: string) => {
  const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthDetails = async () => {
      const isCustomDomain = () => {
        const originalAppOrigin = process.env.NEXT_PUBLIC_SITE_URL;
        const currentAppOrigin = window.location.origin + '/';
        return originalAppOrigin !== currentAppOrigin;
      };
      
      if (!isCustomDomain()) {
        // Clear cached data if the domain is not custom
        localStorage.removeItem(`authDetails_${hostname}`);
        document.cookie = `authDetails_${hostname}=; path=/;`;
        setAuthDetails(null);
        setIsLoading(false);
        return;
      }

      // Check if auth details for this hostname are already in localStorage
      const cachedData = localStorage.getItem(`authDetails_${hostname}`);
      const parsedCachedData = cachedData ? JSON.parse(cachedData) : null;
      setAuthDetails(parsedCachedData);

      // Fetch from the database
      let domainFullData = null;
      try {

        setIsLoading(true);
        domainFullData =
          isCustomDomain() &&
          (await getFullDomainBySubdomain(hostname, true, [
            'theme_color',
            'logo_url',
            'sidebar_background_color',
            'language',
            'favicon_url',
            'auth_card_background_color',
            'auth_section_background_color',
            'logo_dark_url',
            'auth_background_url',
          ]));
      } catch (error) {
        console.error('Error fetching auth details', error);
        return;
      } finally {
        setIsLoading(false);
      }
      
      if (domainFullData) {
        const fetchedAuthDetails = {
          logo_url:
            domainFullData.settings.find(
              (setting) => setting.key === 'logo_url',
            )?.value ?? '',
          theme_color:
            domainFullData.settings.find(
              (setting) => setting.key === 'theme_color',
            )?.value ?? '',
          background_color:
            domainFullData.settings.find(
              (setting) => setting.key === 'sidebar_background_color',
            )?.value ?? '#f2f2f2',
          favicon_url:
            domainFullData.settings.find(
              (setting) => setting.key === 'favicon_url',
            )?.value ?? '',
          auth_card_background_color:
            domainFullData.settings.find(
              (setting) => setting.key === 'auth_card_background_color',
            )?.value ?? '',
          auth_section_background_color:
            domainFullData.settings.find(
              (setting) => setting.key === 'auth_section_background_color',
            )?.value ?? '',
          logo_dark_url:
            domainFullData.settings.find(
              (setting) => setting.key === 'logo_dark_url',
            )?.value ?? '',
          sidebar_background_color:
            domainFullData.settings.find(
              (setting) => setting.key === 'sidebar_background_color',
            )?.value ?? '#f2f2f2',
          auth_background_url:
            domainFullData.settings.find(
              (setting) => setting.key === 'auth_background_url',
            )?.value ?? '',
        };

        // Compare the fetched data with the cached data
        if (
          JSON.stringify(fetchedAuthDetails) !==
          JSON.stringify(parsedCachedData)
        ) {
          // Update state, localStorage, and cookies
          setAuthDetails(fetchedAuthDetails);
          localStorage.setItem(
            `authDetails_${hostname}`,
            JSON.stringify(fetchedAuthDetails),
          );
          document.cookie = `authDetails_${hostname}=${JSON.stringify(
            fetchedAuthDetails,
          )}; path=/;`;
        }

        setOrganizationId(domainFullData?.organizationId);

      }
    };

    void fetchAuthDetails();
  }, [hostname]);


  return { authDetails, organizationId, isLoading };
};
