"use client";

import { LanguageSelector } from "@kit/ui/language-selector";
import { Separator } from "@kit/ui/separator";

import UpdateImage from "../../../../../apps/web/app/components/ui/update-image";
import { useOrganizationSettings } from "../context/organization-settings-context";
import UpdateAccountColorBrand from "./personal-account-settings/update-account-color-brand";
import { UpdateAccountOrganizationName } from "./personal-account-settings/update-account-organization-name";
import { UpdateAccountOrganizationSenderEmailAndSenderDomain } from "./personal-account-settings/update-account-organization-sender-email-and-sender-domain";
import { UpdateAccountOrganizationSenderName } from "./personal-account-settings/update-account-organization-sender-name";
import UpdateAccountOrganizationSidebar from "./personal-account-settings/update-account-organization-sidebar";
import { UpdateAccountOrganizationDomain } from "./personal-account-settings/update-account-organization-domain";
import { useUserWorkspace } from "../hooks/use-user-workspace";
import { useTranslation } from "react-i18next";

interface SiteSettingsProps {
  role: string;
  handleChangeLanguage: (locale: string) => void;
  user: {
    id: string;
    email?: string | null;
    picture_url?: string | null;
  };
}

interface SettingRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showSeparator?: boolean;
}

interface ImageSettingProps {
  title: string;
  identifier: string;
  defaultImageURL: string;
  onUpdate: (value: string) => Promise<void>;
  className?: string;
  bucketStorage: {
    id: string;
    name: string;
    identifier: string;
  };
}

function SiteSettings({ role, handleChangeLanguage }: SiteSettingsProps) {
  const {
    logo_url,
    logo_dark_url,
    updateOrganizationSetting,
    favicon_url,
    language,
  } = useOrganizationSettings();
  const { organization } = useUserWorkspace();

  const { t } = useTranslation("account");

  const bucketStorage = {
    id: organization?.id ?? "",
    name: "organization",
    identifier: "",
  };

  if (role !== "agency_owner") {
    return null;
  }

  return (
    <div className="flex mt-4 w-full flex-wrap gap-6 pb-32 md:pr-48 pr-0 text-sm lg:flex-nowrap">
      <div className="flex w-full flex-col space-y-6">
        {/* Brand Name */}
        <SettingRow title={t("brandName")}>
          <UpdateAccountOrganizationName />
        </SettingRow>

        {/* Language */}
        <SettingRow title={t("language")}>
          <LanguageSelector
            onChange={handleChangeLanguage}
            defaultLanguage={language}
          />
        </SettingRow>

        {/* Brand Color */}
        <SettingRow title={t("brandColor")} showSeparator={false}>
          <UpdateAccountColorBrand />
        </SettingRow>

        {/* Brand Sidebar */}
        <SettingRow title={t("brandSidebar")}>
          <UpdateAccountOrganizationSidebar />
        </SettingRow>

        {/* Logo Section */}
        <LogoSection
          bucketStorage={bucketStorage}
          logo_url={logo_url}
          logo_dark_url={logo_dark_url}
          updateOrganizationSetting={updateOrganizationSetting}
        />

        {/* Favicon */}
        <SettingRow
          title={t("brandFavicon")}
          description={t("brandFaviconDescription")}
        >
          <UpdateImage
            bucketStorage={{
              ...bucketStorage,
              identifier: "favicon",
            }}
            defaultImageURL={favicon_url ?? ""}
            className="aspect-square h-20 w-20"
            onUpdate={async (value: string) => {
              await updateOrganizationSetting.mutateAsync({
                key: "favicon_url",
                value: value,
              });
            }}
          />
        </SettingRow>

        {/* Domain */}
        <SettingRow title={t("brandDomain")}>
          <UpdateAccountOrganizationDomain
            organizationId={organization?.id ?? ""}
          />
        </SettingRow>

        {/* Sender Name */}
        <SettingRow title={t("brandSenderName")}>
          <UpdateAccountOrganizationSenderName />
        </SettingRow>

        {/* Sender Email and Domain */}
        <SettingRow
          title={t("brandSenderEmailAndDomain")}
          showSeparator={false}
        >
          <UpdateAccountOrganizationSenderEmailAndSenderDomain />
        </SettingRow>
      </div>
    </div>
  );
}
// Reusable Setting Row Component
function SettingRow({
  title,
  description,
  children,
  showSeparator = true,
}: SettingRowProps) {
  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
        <div className="md:mr-7 mr-0 md:w-[45%] w-full flex flex-col whitespace-nowrap text-gray-700">
          <p className="font-bold">{title}</p>
          {description && (
            <p className="text-wrap md:max-w-[300px] max-w-full">
              {description}
            </p>
          )}
        </div>
        <div className="w-[100%]">{children}</div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}

// Reusable Image Setting Component
function ImageSetting({
  title,
  identifier,
  defaultImageURL,
  onUpdate,
  className = "aspect-square h-20 w-20",
  bucketStorage,
}: ImageSettingProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold text-gray-700">{title}</p>
      <UpdateImage
        bucketStorage={{
          ...bucketStorage,
          identifier,
        }}
        defaultImageURL={defaultImageURL}
        className={className}
        onUpdate={onUpdate}
      />
    </div>
  );
}

// Reusable Logo Section Component
function LogoSection({
  bucketStorage,
  logo_url,
  logo_dark_url,
  updateOrganizationSetting,
}: {
  bucketStorage: { id: string; name: string; identifier: string };
  logo_url: string | null | undefined;
  logo_dark_url: string | null | undefined;
  updateOrganizationSetting: {
    mutateAsync: (params: {
      key: "logo_url" | "logo_dark_url";
      value: string;
    }) => Promise<unknown>;
  };
}) {
  const { t } = useTranslation("account");

  return (
    <>
      <SettingRow
        title={t("brandLogo")}
        description={t("brandLogoDescription")}
        showSeparator={false}
      >
        <ImageSetting
          title={t("lightVersion")}
          identifier="lightLogo"
          defaultImageURL={logo_url ?? ""}
          onUpdate={async (value: string) => {
            await updateOrganizationSetting.mutateAsync({
              key: "logo_url",
              value: value,
            });
          }}
          bucketStorage={bucketStorage}
        />
      </SettingRow>

      <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
        <div className="md:mr-7 mr-0 md:w-[45%] w-2/3 flex flex-col whitespace-nowrap text-gray-700">
          <p className="font-bold text-gray-700">{t("darkVersion")}</p>
        </div>
        <div className="w-[100%] flex flex-col gap-2">
          <UpdateImage
            bucketStorage={{
              ...bucketStorage,
              identifier: "darkLogo",
            }}
            defaultImageURL={logo_dark_url ?? ""}
            className="aspect-square h-20 w-20 bg-black"
            onUpdate={async (value: string) => {
              await updateOrganizationSetting.mutateAsync({
                key: "logo_dark_url",
                value: value,
              });
            }}
          />
        </div>
      </div>
      <Separator />
    </>
  );
}

export default SiteSettings;
