import { PageBody } from "@kit/ui/page";
import { createI18nServerInstance } from "~/lib/i18n/i18n.server";
import ButtonsHeader from "../components/buttons-header";
import SettingsContent from "../components/settings-content";
import { fetchCurrentUserAccount } from "~/team-accounts/src/server/actions/members/get/get-member-account";
import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('plugins:settingsTitle'),
  };
};

async function PluginSettingsPage() {
  const client = getSupabaseServerComponentClient()
  const user = await fetchCurrentUserAccount(client)

  return (
    <PageBody>
        <ButtonsHeader />
        <SettingsContent userId = {user.id} />
    </PageBody>
  );
}

export default PluginSettingsPage;
