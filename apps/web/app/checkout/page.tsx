import Link from 'next/link';

import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getTokenData } from '~/team-accounts/src/server/actions/tokens/get/get-token';

import { decodeToken } from '../../../../packages/tokens/src/decode-token';
import DetailsSide from './components/details';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('services:details.title'),
  };
};

async function ServiceCheckoutPage({
  searchParams: { tokenId },
}: {
  searchParams: { tokenId: string };
}) {
  let expiredToken = false;
  const token = await getTokenData(tokenId);

  if (new Date(token?.expires_at ?? '') < new Date()) {
    expiredToken = true;
  }

  const tokendecoded = decodeToken(token?.access_token ?? '');

  return (
    <PageBody className="lg:px-0">
      <div className="flex w-full flex-col items-center justify-center">
        {expiredToken ? (
          <div className="flex h-screen w-full items-center justify-center">
            <div className="text-center">
              <div className="text-red-500">
                <Trans i18nKey="services:checkout:tokenExpired" />
              </div>
              <Link href="/auth/sign-in">
                <Button className="mt-4">
                  <Trans i18nKey="services:checkout:signIn" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 w-full px-32">
              <Separator className="w-full" />
            </div>
            <DetailsSide
              service={tokendecoded.service}
              stripeId={tokendecoded.account_id}
              organizationId={tokendecoded.organization_id}
              tokenId={tokenId}
            />
          </div>
        )}
      </div>
    </PageBody>
  );
}

export default withI18n(ServiceCheckoutPage);
