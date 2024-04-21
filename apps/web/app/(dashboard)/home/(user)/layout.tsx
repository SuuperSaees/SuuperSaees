import { Page } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';

import { HomeSidebar } from './_components/home-sidebar';

function UserHomeLayout({ children }: React.PropsWithChildren) {
  return <Page sidebar={<HomeSidebar />}>{children}</Page>;
}

export default withI18n(UserHomeLayout);
