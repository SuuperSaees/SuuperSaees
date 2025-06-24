import { PageBody } from "@kit/ui/page";
import { PageHeader } from "~/(main)/../components/page-header";
import { TimerContainer } from "~/(main)/../components/timer-container";
import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import { withI18n } from "~/lib/i18n/with-i18n";
import { getClients } from "~/server/actions/clients/get-clients";
import { loadUserWorkspace } from "~/(main)/home/(user)/_lib/server/load-user-workspace";
import { getServicesByOrganizationId } from "~/server/actions/services/get-services";
import { getInvoice } from "~/server/actions/invoices/invoices.action";
import { Client } from "~/lib/client.types";
import { Service } from "~/lib/services.types";
// Invoice type is used in the component
import { notFound } from "next/navigation";
import { InvoiceForm } from "../components/form/form";

interface UpdateInvoicePageProps {
  params: {
    id: string;
  };
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("invoices:update.title");

  return {
    title,
  };
};

async function UpdateInvoicePage({ params }: UpdateInvoicePageProps) {
  const { organization, agency, workspace } = await loadUserWorkspace();
  const userRole = workspace.role ?? "";
  const agencyId =
    (userRole.startsWith("agency_") ? organization.id : agency?.id) ?? "";

  // Fetch all required data in parallel
  const [invoice, clients, services] = await Promise.all([
    getInvoice(params.id).catch(() => null),
    getClients(agencyId) as Promise<Client.Response[]>,
    getServicesByOrganizationId() as Promise<Service.Relationships.Billing.BillingService[]>,
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <PageBody className="h-full">
      <PageHeader
        title="invoices:update.title"
        rightContent={<TimerContainer />}
        className="w-full"
      />
      <InvoiceForm 
        clients={clients} 
        services={services} 
        agencyId={agencyId}
        invoice={invoice}
        mode="update"
      />
    </PageBody>
  );
}

export default withI18n(UpdateInvoicePage); 