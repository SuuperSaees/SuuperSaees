'use client';

import { PlusIcon } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import PrefetcherLink from '~/../app/components/shared/prefetcher-link';

const AddServiceButton = ({ show = true }: { show?: boolean }) => {
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace.role ?? '';
  const allowedRoles = ['agency_owner', 'agency_project_manager'];
  const hasPermission = allowedRoles.includes(userRole);

  const { t } = useTranslation('services');

  if (!show || !hasPermission) return null;

  return (
    <PrefetcherLink href="/services/create">
      <ThemedButton aria-label={'Create service'}>
        <PlusIcon className="h-4 w-4" />
        <span>
          {t('createService')}
        </span>
      </ThemedButton>
    </PrefetcherLink>
  );
};

export default AddServiceButton;
