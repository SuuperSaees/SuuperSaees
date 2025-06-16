import { Trans } from "@kit/ui/trans";
import PrefetcherLink from "~/(main)/../components/shared/prefetcher-link";

export const InvoiceSettingsLink = () => {
  return (
    <PrefetcherLink href="/settings" className="text-gray-600">
      <Trans i18nKey="invoices:creation.warning.link" />
    </PrefetcherLink>
  );
};
