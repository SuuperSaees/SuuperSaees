import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import PendingApprovalContainer from './components/pending-approval-container';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:pendingApproval'),
  };
};

function PendingApprovalPage() {
  return <PendingApprovalContainer />;
}

export default withI18n(PendingApprovalPage);
