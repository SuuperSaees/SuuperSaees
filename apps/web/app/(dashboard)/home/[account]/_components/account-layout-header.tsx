import { PageHeader } from '@kit/ui/page';

import { AccountNotifications } from '~/(dashboard)/home/[account]/_components/account-notifications';

import { AccountLayoutMobileNavigation } from './account-layout-mobile-navigation';

export function AccountLayoutHeader({
  children,
  title,
  description,
  account,
}: React.PropsWithChildren<{
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  account: string;
}>) {
  return (
    <PageHeader
      title={title}
      description={description}
      mobileNavigation={<AccountLayoutMobileNavigation account={account} />}
    >
      <div className={'flex space-x-4'}>
        {children}

        <AccountNotifications accountId={account} />
      </div>
    </PageHeader>
  );
}
