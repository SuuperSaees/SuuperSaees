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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('organizations:title');

  return {
    title,
  };
};

export default function UserAddOrganizationPage() {
  return (
    <>
      <PageBody className={''}>
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
      </PageBody>
    </>
  );
}



