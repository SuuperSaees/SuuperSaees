import { PageBody } from "@kit/ui/page";

import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import { withI18n } from "~/lib/i18n/with-i18n";
import  InvoicesTable  from "./components/table";
import { PageHeader } from "~/(main)/../components/page-header";
import { getInvoices } from "~/server/actions/invoices/invoices.action";
import AddButton from "./components/add-button";

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
        className="w-full"
        rightContent={<AddButton />}
      />
    
      <InvoicesTable initialData={invoices}/>
    </PageBody>
  );
}

export default withI18n(InvoicesPage);
