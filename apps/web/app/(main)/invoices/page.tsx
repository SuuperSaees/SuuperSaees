import { PageBody } from "@kit/ui/page";

import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import { withI18n } from "~/lib/i18n/with-i18n";
import  InvoicesTable  from "./components/table";
import { PageHeader } from "~/(main)/../components/page-header";
import { TimerContainer } from "~/(main)/../components/timer-container";
import { getInvoices } from "~/server/actions/invoices/invoices.action";

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("invoices:title");

  return {
    title,
  };
};

async function InvoicesPage() {
  const invoices = await getInvoices({
    pagination: {
      limit: 100,
      page: 1,
    },
  });

  return (
    <PageBody >
      <PageHeader
        title="invoices:title"
        rightContent={<TimerContainer />}
        className="w-full"
      />
      <InvoicesTable initialData={invoices}/>
    </PageBody>
  );
}

export default withI18n(InvoicesPage);
