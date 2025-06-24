import { PageBody } from "@kit/ui/page";
import { PageHeader } from "~/(main)/../components/page-header";
import { TimerContainer } from "~/(main)/../components/timer-container";
// import { Alert } from "~/(main)/../components/shared/export-csv-button/alert";
import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import { withI18n } from "~/lib/i18n/with-i18n";
// import { InvoiceSettingsLink } from "./components/settings-link";
import { InvoiceForm } from "../components/form/form";
// import { Trans } from "@kit/ui/trans";
import { getClients } from "~/server/actions/clients/get-clients";
import { loadUserWorkspace } from "~/(main)/home/(user)/_lib/server/load-user-workspace";
import { getServicesByOrganizationId } from "~/server/actions/services/get-services";
import { Client } from "~/lib/client.types";
import { Service } from "~/lib/services.types";

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("invoices:creation.title");

  return {
    title,
  };
};

async function CreateInvoicesPage() {
  const { organization, agency, workspace } = await loadUserWorkspace();
  const userRole = workspace.role ?? "";
  const agencyId =
    (userRole.startsWith("agency_") ? organization.id : agency?.id) ?? "";
  const clients = (await getClients(agencyId)) as Client.Response[];
  const services =
    (await getServicesByOrganizationId()) as Service.Relationships.Billing.BillingService[];


  return (
    <PageBody className="h-full">
      <PageHeader
        title="invoices:creation.title"
        rightContent={<TimerContainer />}
        className="w-full"
      />
      {/* <Alert
        description={<Trans i18nKey="invoices:creation.warning.description" />}
        visible={true}
        action={<InvoiceSettingsLink />}
        type="info"
      /> */}
      <InvoiceForm 
        clients={clients} 
        services={services} 
        agencyId={agencyId}
        mode="create"
      />
    </PageBody>
  );
}

export default withI18n(CreateInvoicesPage);
