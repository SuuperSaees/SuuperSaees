import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';



import { Trans } from '@kit/ui/trans';

import { AddServiceDialog } from './add-service-dialog';

type ServiceOption = {
  value: number;
  label: string;
  action?: () => void;
};
interface ServiceButtonTriggersProps {
  serviceOptions?: ServiceOption[];
  clientOrganizationId: string;
  isPending: boolean;
  currentUserRole: string;
}
export default function ServiceButtonTriggers({
  serviceOptions,
  clientOrganizationId,
  isPending,
  currentUserRole,
}: ServiceButtonTriggersProps) {
  if (
    currentUserRole !== 'agency_owner' &&
    currentUserRole !== 'agency_project_manager'
  )
    return null;

  return (
    <AddServiceDialog
      serviceOptions={serviceOptions}
      clientOrganizationId={clientOrganizationId}
      isPending={isPending}
    >
      <ThemedButton>
        <Trans i18nKey={'service:addService'} />
      </ThemedButton>
    </AddServiceDialog>
  );
}