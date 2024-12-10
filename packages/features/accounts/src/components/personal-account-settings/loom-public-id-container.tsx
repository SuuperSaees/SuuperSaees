import React, { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Spinner } from '@kit/ui/spinner';

import { getOrganization } from '../../../../team-accounts/src/server/actions/organizations/get/get-organizations';
import { updateOrganization } from '../../../../team-accounts/src/server/actions/organizations/update/update-organizations';
import { ThemedInput } from '../ui/input-themed-with-settings';
import { CopyDomain } from './copy-domain';
import { getDomainByUserId } from '../../../../../multitenancy/utils/get/get-domain';

interface LoomPublicIdContainerProps {
  organizationId: string;
  userId: string;
}

function LoomPublicIdContainer({
  organizationId,
  userId,
}: LoomPublicIdContainerProps) {
  const [loomAppId, setLoomAppId] = useState<string>('');
  const [domain, setDomain] = useState<string>('');

  const {
    data: getOrganizationData,
    isLoading: isLoadingOrganization,
    isPending: isPendingOrganization,
  } = useQuery({
    queryKey: ['account-settings', userId],
    queryFn: async () => await getOrganization(),
    enabled: !!userId,
  });

  const {
    data: getDomainData,
    isLoading: isLoadingDomain,
    isPending: isPendingDomain,
  } = useQuery({
    queryKey: ['get-subdomain', userId],
    queryFn: async () => await getDomainByUserId(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (getOrganizationData) {
      setLoomAppId(getOrganizationData?.loom_app_id ?? '');
    }
  }, [getOrganizationData]);

  useEffect(() => {
    if (getDomainData) {
      setDomain(getDomainData.domain);
    }
  }, [getDomainData]);

  const { t } = useTranslation('account');

  const updateOrganizationMutation = useMutation({
    mutationFn: async () => {
      await updateOrganization(organizationId, {
        loom_app_id: loomAppId,
      });
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'), {
        description: t('updateSuccessOrganization'),
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('error'), {
        description: t('updateErrorOrganization'),
      });
    },
  });

  return (
    <>
      {isLoadingOrganization || isPendingOrganization || isLoadingDomain || isPendingDomain ? (
        <Spinner className="h-5" />
      ) : (
        <div className='w-full'>
          <CopyDomain value={domain} className='mb-3' label={''} />
          <ThemedInput
            data-test={'account-display-name'}
            minLength={2}
            placeholder={t('loomAppIdTitle')}
            maxLength={100}
            value={loomAppId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLoomAppId(e.target.value)
            }
            onBlur={() => updateOrganizationMutation.mutate()}
          />
        </div>
      )}
    </>
  );
}

export default LoomPublicIdContainer;
