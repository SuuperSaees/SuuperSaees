import { PageBody } from "@kit/ui/page";
import { PageHeader } from "~/(main)/../components/page-header";
import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import { withI18n } from "~/lib/i18n/with-i18n";
import ServicesCatalog from "../components/catalog";
import { getSession } from "~/app/server/actions/accounts/accounts.action";
import { getOrganizationSettingsByOrganizationId } from "@kit/team-accounts/server/actions/organizations/get/get-organizations";
import { headers } from "next/headers";
import ShareCatalogButton from "../components/share-catalog-button";
import { getServicesByOrganizationId } from "~/server/actions/services/get-services";
import { Pagination } from "~/lib/pagination";
import { Service } from "~/lib/services.types";

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

  // Get organization ID from current user session (no multitenancy)
  const sessionData = await getSession();
  const organizationId = sessionData?.organization?.id ?? "";

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

  // Get organization settings (logo_url, theme_color) directly from organization
  let logoUrl = "";
  let themeColor = "";
  if (organizationId) {
    try {
      const organizationSettings = await getOrganizationSettingsByOrganizationId(
        organizationId,
        true,
        ['logo_url', 'theme_color'],
      );
      logoUrl = organizationSettings.find((setting) => setting.key === "logo_url")?.value ?? "";
      themeColor = organizationSettings.find((setting) => setting.key === "theme_color")?.value ?? "";
    } catch (error) {
      console.error('Error fetching organization settings:', error);
    }
  }

  // When pagination config is provided, the function returns Pagination.Response<T>
  const initialServices = await getServicesByOrganizationId({
    pagination: {
      page: 1,
      limit: 120, // Multiple of 6, so we can show 6 cards per page and not show the last page with less than 6 cards
    },
    filters: [
      {
        field: 'visibility',
        operator: 'eq',
        value: 'public',
      },
    ],
  }, organizationId, true) as Pagination.Response<Service.Relationships.Billing.BillingService>;
  
  return (
    <PageBody className="w-full h-full">
      <PageHeader title="services:catalog.title" className="w-full flex">
        <div className="flex items-center justify-end flex-1">
          <ShareCatalogButton baseUrl={baseUrl} />
        </div>
      </PageHeader>

      <ServicesCatalog
        initialServices={initialServices}
        organizationId={organizationId}
        isPublicView={isPublicView}
        logoUrl={logoUrl}
        themeColor={themeColor}
      />
    </PageBody>
  );
}

export default withI18n(ServicesCatalogPage);
