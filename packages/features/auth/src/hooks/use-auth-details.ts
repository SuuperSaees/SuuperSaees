'use client';

import { useEffect, useState } from 'react';

import { getFullDomainBySubdomain } from '../../../../multitenancy/utils/get/get-domain';

interface AuthDetails {
  logo_url: string;
  theme_color: string;
  background_color: string;
  favicon_url: string;
}

export const useAuthDetails = (hostname: string) => {
  const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);

  useEffect(() => {
    const fetchAuthDetails = async () => {
      // Check if auth details for this hostname are already in localStorage
      const cachedData = localStorage.getItem(`authDetails_${hostname}`);
      const parsedCachedData = cachedData ? JSON.parse(cachedData) : null;
      setAuthDetails(parsedCachedData);

      // Fetch from the database
      let domainFullData = null;
      try {
        domainFullData = await getFullDomainBySubdomain(hostname, true, [
          'theme_color',
          'logo_url',
          'sidebar_background_color',
          'language',
          'favicon_url',
        ]);
      } catch (error) {
        console.error('Error fetching auth details', error);
        return;
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
          document.cookie = `authDetails_${hostname}=${JSON.stringify(fetchedAuthDetails)}; path=/;`;
        }
      }
    };

    void fetchAuthDetails();
  }, [hostname]);

  return authDetails;
};
