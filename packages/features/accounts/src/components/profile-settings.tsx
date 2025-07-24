import { useCallback, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Input } from "@kit/ui/input";
import { LanguageSelector } from "@kit/ui/language-selector";
import { Separator } from "@kit/ui/separator";

import UpdateImage from "../../../../../apps/web/app/components/ui/update-image";
import { UserSettings } from "../../../../../apps/web/lib/user-settings.types";
import { updateUserSettings } from "../../../../../packages/features/team-accounts/src/server/actions/members/update/update-account";
import { useRevalidatePersonalAccountDataQuery } from "../hooks/use-personal-account-data";
import { UpdateEmailFormContainer } from "./personal-account-settings/email/update-email-form-container";
import { UpdatePasswordFormContainer } from "./personal-account-settings/password/update-password-container";
import { UpdateAccountDetailsFormContainer } from "./personal-account-settings/update-account-details-form-container";

interface ProfileSettingsProps {
  userId: string;
  userSettings:
    | Pick<
        UserSettings.Type,
        "name" | "picture_url" | "calendar" | "preferences"
      >
    | null
    | undefined;
  callback: string;
  userRole: string;
}

interface SettingRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showSeparator?: boolean;
}

function ProfileSettings({
  userId,
  callback,
  userSettings,
  userRole,
}: ProfileSettingsProps) {
  const { t } = useTranslation("account");
  const [calendarValue, setCalendarValue] = useState(
    userSettings?.calendar ?? "",
  );
  const [isValidUrl, setIsValidUrl] = useState(true);
  const revalidateAccount = useRevalidatePersonalAccountDataQuery();

  const validateUrl = useCallback((url: string) => {
    if (url === "") return true;
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        "hubspot.com",
        "calendly.com",
        "cal.com",
        "google.com",
        "outlook.com",
        "outlook.office.com",
        "tidycal.com",
        "calendar.app.google",
      ];
      const domain = parsedUrl.hostname.replace("www.", "");
      return allowedDomains.some((allowedDomain) =>
        domain.endsWith(allowedDomain),
      );
    } catch (e) {
      return false;
    }
  }, []);

  const updateAccountCalendar = useMutation({
    mutationFn: async (calendar: UserSettings.Type["calendar"]) => {
      if (userId) {
        await updateUserSettings(userId, { calendar: calendar ?? "" });
      } else {
        throw new Error("User ID is undefined");
      }
    },
    onSuccess: () => {
      toast.success(t("updateSuccess"), {
        description: t("updateCalendarSuccess"),
      });
    },
    onError: () => {
      toast.error("Error", {
        description: t("updateCalendarError"),
      });
    },
  });

  const handleLanguageChange = useCallback(
    async (locale: string) => {
      if (userId) {
        try {
          // Update the user's language preference in the database
          await updateUserSettings(userId, {
            preferences: {
              user: {
                language: locale,
              },
            },
          });

          // Show success message
          toast.success(t("updateSuccess"), {
            description: t("updateLanguageSuccess"),
          });
        } catch (error) {
          toast.error("Error", {
            description: t("updateLanguageError"),
          });
          console.error("Error updating language preference:", error);
        }
      }
    },
    [userId, t],
  );

  const handleCalendarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCalendarValue(value);
      setIsValidUrl(validateUrl(value));
    },
    [validateUrl],
  );

  const clientRoles = new Set(["client_owner", "client_member"]);

  const bucketStorage = {
    id: userId ?? "",
    name: "account_image",
    identifier: "profilePicture",
  };

  const updateProfileImage = async (value: string) => {
    try {
      await updateUserSettings(userId ?? "", { picture_url: value });
      toast.success(t("updateSuccess"), {
        description: t("updateProfileSuccess"),
      });
      await revalidateAccount(userId ?? "");
    } catch (error) {
      toast.error("Error", {
        description: t("updateProfileError"),
      });
      console.error("Error updating profile image:", error);
    }
  };

  return (
    <div className="flex mt-4 w-full flex-wrap gap-6 pb-32 md:pr-48 pr-0 text-sm lg:flex-nowrap">
      <div className="flex w-full flex-col space-y-6">
        {/* Account Image */}
        <SettingRow
          title={t("accountImage")}
          description={t("accountImageDescription")}
        >
          <UpdateImage
            bucketStorage={bucketStorage}
            defaultImageURL={userSettings?.picture_url ?? ""}
            className="aspect-square h-20 w-20 [&>img]:object-cover"
            onUpdate={updateProfileImage}
          />
        </SettingRow>

        {/* Name */}
        <SettingRow title={t("name")} description={t("nameDescription")}>
          <UpdateAccountDetailsFormContainer
            user={{
              id: userId,
              name: userSettings?.name ?? "",
              settings: {
                ...userSettings,
                name: userSettings?.name ?? "",
                picture_url: userSettings?.picture_url ?? "",
              },
            }}
          />
        </SettingRow>

        {/* Language Preference */}
        <SettingRow
          title={t("language")}
          description={t("languageDescription")}
        >
          <div className="flex w-full flex-col gap-4">
            <LanguageSelector onChange={handleLanguageChange} />
          </div>
        </SettingRow>

        {/* Calendar (only for non-client roles) */}
        {!clientRoles.has(userRole) && (
          <SettingRow
            title={t("calendar")}
            description={t("calendarDescription")}
          >
            <div className="flex w-full flex-col gap-4">
              <Input
                placeholder={t("pasteCalendar")}
                value={calendarValue}
                onChange={handleCalendarChange}
                className={
                  !isValidUrl && calendarValue !== "" ? "border-red-500" : ""
                }
                onBlur={() => {
                  if (isValidUrl) {
                    updateAccountCalendar.mutate(calendarValue);
                  }
                }}
              />
              {!isValidUrl && calendarValue !== "" && (
                <p className="text-sm text-red-500">Please enter a valid URL</p>
              )}
            </div>
          </SettingRow>
        )}

        {/* Email Update */}
        <SettingRow
          title={t("updateEmailCardTitle")}
          description={t("updateEmailCardDescription")}
        >
          <UpdateEmailFormContainer callbackPath={callback} />
        </SettingRow>

        {/* Password Update */}
        <SettingRow
          title={t("updatePasswordCardTitle")}
          description={t("updatePasswordCardDescription")}
          showSeparator={false}
        >
          <UpdatePasswordFormContainer callbackPath={callback} />
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

export default ProfileSettings;
