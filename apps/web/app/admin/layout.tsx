import { Page, PageBody, PageHeader } from '@kit/ui/page';

import { AdminSidebar } from '~/admin/_components/admin-sidebar';
import { AdminMobileNavigation } from '~/admin/_components/mobile-navigation';

export const metadata = {
  title: `Super Admin`,
};

export default function AdminLayout(props: React.PropsWithChildren) {
  return (
    <Page sidebar={<AdminSidebar />}>
      <PageHeader
        mobileNavigation={<AdminMobileNavigation />}
        title={'Super Admin'}
        description={`Your SaaS stats at a glance`}
      />

      <PageBody>{props.children}</PageBody>
    </Page>
  );
}
