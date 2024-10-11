import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';
import { UpdatePasswordFormContainer } from '../../../../packages/features/accounts/src/components/personal-account-settings/password/update-password-container';
import { getDomainByUserId } from '../../../../packages/multitenancy/utils/get-domain-by-user-id';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

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
  const baseUrl = await getDomainByUserId(userData?.user.id, true);

  return (
    <>
      <PageBody className='flex flex-col items-center justify-center'>
        <div className='flex flex-col items-center justify-center'>
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans i18nKey={'account:updatePasswordCardTitle'} />
              </CardTitle>

              <CardDescription>
                <Trans i18nKey={'account:updatePasswordCardDescription'} />
              </CardDescription>
            </CardHeader>

            <CardContent>
              <UpdatePasswordFormContainer callbackPath={`${baseUrl}home`} />
            </CardContent>
          </Card>
        </div>
      
      </PageBody>
    </>
  );
}



