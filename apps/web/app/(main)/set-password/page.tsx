import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import { SetPasswordForm } from './components/set-password-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('organizations:title');

  return {
    title,
  };
};

export default async function UserAddOrganizationPage() {
  const supabase = getSupabaseServerComponentClient();
  const { error: userError } = await supabase.auth.getUser();

  if (userError) throw userError.message;

  return (
    <SetPasswordForm />
  )
}
