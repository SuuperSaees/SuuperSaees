'use client';

import { useEffect, useState } from 'react';

import { getFullDomainBySubdomain } from '../../../../multitenancy/utils/get/get-domain';

interface AuthDetails {
  logo_url: string;
  theme_color: string;
}

export const useAuthDetails = (hostname: string) => {
  const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);

  useEffect(() => {
    const fetchAuthDetails = async () => {
      const domainFullData = await getFullDomainBySubdomain(hostname, true);

      if (domainFullData) {
        setAuthDetails({
          logo_url:
            domainFullData.settings.find(
              (setting) => setting.key === 'logo_url',
            )?.value ?? '', // Default to empty string if not found, and manage in the component
          theme_color:
            domainFullData.settings.find(
              (setting) => setting.key === 'theme_color',
            )?.value ?? '', // Default to empty string if not found, and manage in the component
        });
      }
    };

    void fetchAuthDetails();
  }, [hostname]);

  return authDetails;
};
