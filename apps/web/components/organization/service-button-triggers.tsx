import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

import { Trans } from '@kit/ui/trans';

import { AddServiceDialog } from './add-service-dialog';

type ServiceOption = {
  value: string;
  label: string;
  action?: () => void;
};
interface ServiceButtonTriggersProps {
  serviceOptions: ServiceOption[];
  clientOrganizationId: string;
}
export function ServiceButtonTriggers({
  serviceOptions,
  clientOrganizationId,
}: ServiceButtonTriggersProps) {
  const handleCreation = () => {
    // Handle button click logic here
    console.log('Service added!');
  };
  return (
    <AddServiceDialog
      serviceOptions={serviceOptions}
      clientOrganizationId={clientOrganizationId}
    >
      <ThemedButton onClick={handleCreation}>
        <Trans i18nKey={'service:addService'} />
      </ThemedButton>
    </AddServiceDialog>
  );
}
