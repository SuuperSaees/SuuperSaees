import { PageBody } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';

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
  const token = await getTokenData(tokenId);

  const tokendecoded = decodeToken(token?.access_token ?? '');

  return (
    <PageBody className="min-h-screen flex flex-col">
      <div className="flex flex-col w-full items-center  flex-grow my-10">
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
    </PageBody>
  );
}

export default withI18n(ServiceCheckoutPage);
