import { PageHeader } from '@kit/ui/page';

import { UserNotifications } from '~/(dashboard)/home/(user)/_components/user-notifications';

import { UserLayoutMobileNavigation } from './user-layout-mobile-navigation';

export function UserAccountHeader(
  props: React.PropsWithChildren<{
    title: string | React.ReactNode;
    description?: string | React.ReactNode;
  }>,
) {
  return (
    <PageHeader
      title={props.title}
      description={props.description}
      mobileNavigation={<UserLayoutMobileNavigation />}
    >
      <div className={'flex space-x-4'}>
        {props.children}

        <UserNotifications />
      </div>
    </PageHeader>
  );
}
