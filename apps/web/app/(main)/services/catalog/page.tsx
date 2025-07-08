import { PageBody } from "@kit/ui/page";
import { PageHeader} from "~/(main)/../components/page-header";
import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import { withI18n } from "~/lib/i18n/with-i18n";
import ServicesCatalog from "./catalog";
import { getFullDomainBySubdomain } from "~/multitenancy/utils/get/get-domain";
import { headers } from "next/headers";

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('services:catalog.title'),
  };
};

async function ServicesCatalogPage() {
  // Get current domain from headers
  const headersList = headers();
  const host = headersList.get('host') ?? '';
  
  // Get organization data from the subdomain
  const domainData = await getFullDomainBySubdomain(host, true);
  
  // Get current user and role
  
  // Extract organization ID from domain data
  const organizationId = domainData.organizationId ?? '';
  
  // Load current user workspace to get the user role
  // Get user role (you might need to adjust this based on your user structure)

  console.log('host', host, 'organizationId', organizationId);
  return (
    <PageBody>
      <PageHeader
        title="services:catalog.title"
        className="w-full"
      />


      <ServicesCatalog 
        organizationId={organizationId}
      />
    </PageBody>
  )
}

export default withI18n(ServicesCatalogPage);