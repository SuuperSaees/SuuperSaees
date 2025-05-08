import { PageBody } from '@kit/ui/page';

import { loadUserWorkspace } from '~/(main)/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getEmbeds } from '~/server/actions/embeds/embeds.action';

import { EmbedSection } from './components/embed-section';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('embeds:title'),
  };
};

async function EmbedsPage() {
  const {
    agency,
    organization,
    workspace: userWorkspace,
  } = await loadUserWorkspace();
  const userRole = userWorkspace.role ?? '';
  const userId = userWorkspace.id ?? '';
  const agencyId = agency ? agency.id ?? '' : organization ? organization?.id ?? '' : '';

  const embeds = await getEmbeds();
  
  return (
    <PageBody className="flex h-full flex-col gap-8 p-8 py-8 lg:px-8">
      <h1 className="text-2xl font-bold">Embeds</h1>

      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Embeds Content */}
        <EmbedSection
          embeds={embeds}
          agencyId={agencyId}
          userId={userId}
          userRole={userRole}
        />
      </div>
    </PageBody>
  );
}

export default withI18n(EmbedsPage);
