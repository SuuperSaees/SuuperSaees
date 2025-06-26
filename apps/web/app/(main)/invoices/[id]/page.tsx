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
import { InvoiceForm } from "../components/form/form";
import { Trans } from "@kit/ui/trans";

interface UpdateInvoicePageProps {
  params: {
    id: string;
  };
}

export const generateMetadata = async ({ params }: UpdateInvoicePageProps) => {
  const i18n = await createI18nServerInstance();
  
  try {
    const invoice = await getInvoice(params.id);
    const title = i18n.t("invoices:update.title", { number: invoice.number });
    
    return {
      title,
    };
  } catch (error) {
    // Fallback title if invoice doesn't exist or fails to load
    const title = i18n.t("invoices:update.title", { number: "" });
    return {
      title,
    };
  }
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


  return (
    <PageBody >
      <PageHeader
        title="invoices:update.title"
        rightContent={<TimerContainer />}
        className="w-full flex"
      >
         <h2 className="text-xl font-medium">
          <Trans i18nKey="invoices:update.title" values={{ number: invoice.number }} />
        </h2>
      </PageHeader>
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