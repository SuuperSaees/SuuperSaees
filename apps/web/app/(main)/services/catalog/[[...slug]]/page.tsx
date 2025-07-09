import { PageBody } from "@kit/ui/page";
import { PageHeader } from "~/(main)/../components/page-header";
import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import { withI18n } from "~/lib/i18n/with-i18n";
import ServicesCatalog from "../catalog";
import { getFullDomainBySubdomain } from "~/multitenancy/utils/get/get-domain";
import { headers } from "next/headers";
import ShareCatalogButton from "../share-catalog-button";
import { Trans } from "@kit/ui/trans";

interface ServicesCatalogPageProps {
  params: {
    slug?: string[];
  };
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t("services:catalog.title"),
  };
};

async function ServicesCatalogPage({ params }: ServicesCatalogPageProps) {
  // Get current domain from headers
  const headersList = headers();
  const host = headersList.get("host") ?? "";

  // Get organization data from the subdomain
  const domainData = await getFullDomainBySubdomain(host, true);

  // Get current user and role

  // Extract organization ID from domain data
  const organizationId = domainData.organizationId ?? "";

  // Load current user workspace to get the user role
  // Get user role (you might need to adjust this based on your user structure)

  // Access the slug parameter (will be undefined for /services/catalog, ["public"] for /services/catalog/public, etc.)
  const { slug } = params;
  const isPublicView = slug?.includes("public") ?? false;


  // Get the protocol dynamically
  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.includes("127.0.0.1")
      ? "http"
      : "https");

  // Get the base URL for sharing
  const baseUrl = `${protocol}://${host}`;

  return (
    <PageBody className="w-full h-full">
      <PageHeader title="services:catalog.title" className="w-full flex">
        <h2 className="font-inter text-xl font-medium leading-4">
          <Trans i18nKey="services:catalog.title" />
        </h2>
        <div className="flex items-center justify-end flex-1">
          <ShareCatalogButton baseUrl={baseUrl} />
        </div>
      </PageHeader>

      <ServicesCatalog
        organizationId={organizationId}
        hostname={host}
        isPublicView={isPublicView}
      />
    </PageBody>
  );
}

export default withI18n(ServicesCatalogPage);
