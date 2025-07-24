'use client'

import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import { Trans } from "@kit/ui/trans";
import { PlusIcon } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import PrefetcherLink from "~/(main)/../components/shared/prefetcher-link";

const AddButton = () => {
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace?.role ?? ''; 

  const canCreateInvoice = userRole === 'agency_owner' || userRole === 'agency_project_manager'

  if (!canCreateInvoice) return null;
  return (
    // TODO: Use only link, the use of themed button is not needed
    // Right now is only being used for the theme color
    <PrefetcherLink href="/invoices/create">
      <ThemedButton className="h-fit" aria-label={'Create invoice'}>
        <PlusIcon className="h-4 w-4" />
        <span>
          <Trans i18nKey="invoices:creation.form.actions.createInvoice" />
        </span>
      </ThemedButton>
    </PrefetcherLink>
  );
};

export default AddButton;
