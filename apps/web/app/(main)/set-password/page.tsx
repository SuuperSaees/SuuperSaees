import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import { UpdatePasswordFormContainer } from '../../../../packages/features/accounts/src/components/personal-account-settings/password/update-password-container';
import { getDomainByUserId } from '../../../../packages/multitenancy/utils/get/get-domain';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('organizations:title');

  return {
    title,
  };
};

export default async function UserAddOrganizationPage() {
  const supabase = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError.message;
  const { domain: baseUrl } = await getDomainByUserId(
    userData?.user.id,
    true,
  ).catch(() => {
    console.error('Error getting domain');
    return { domain: '' };
  });

  return <UpdatePasswordFormContainer callbackPath={`${baseUrl}home`} />;
}
