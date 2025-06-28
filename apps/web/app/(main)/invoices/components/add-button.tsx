import { Trans } from "@kit/ui/trans";
import { PlusIcon } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import PrefetcherLink from "~/(main)/../components/shared/prefetcher-link";

const AddButton = () => {
  return (
    // TODO: Use only link, the use of themed button is not needed
    // Right now is only being used for the theme color
    <PrefetcherLink href="/invoices/create" className="ml-auto">
      <ThemedButton className="h-fit">
        <PlusIcon className="h-4 w-4" />
        <Trans i18nKey="invoices:creation.form.actions.createInvoice" />
      </ThemedButton>
    </PrefetcherLink>
  );
};

export default AddButton;
