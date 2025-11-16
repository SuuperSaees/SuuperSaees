'use client';

// import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useRevalidatePersonalAccountDataQuery } from '@kit/accounts/hooks/use-personal-account-data';

import { Section } from '~/contexts/section';
import { ViewsMap } from '~/contexts/types/section.types';
import { UserWithSettings } from '~/lib/account.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';
import { AgencyStatusesProvider } from '~/(main)/orders/components/context/agency-statuses-context';
import { updateUserSettings } from '~/team-accounts/src/server/actions/members/update/update-account';

// import Header from '../../../components/accounts/header';
import HomeSection from './home-section';
import ReviewsSection from './reviews-section';

export default function Member({
  id,
  userRole,
  user,
  agencyStatuses,
  agencyMembers,
}: {
  id: string;
  userRole: string;
  user: {
    name: string;
    email: string | null;
    id: string;
    settings: {
      name: string | null;
      picture_url: string | null;
    } | null;
  };
  orders: Order.Type[];
  agencyStatuses: AgencyStatus.Type[];
  agencyMembers: UserWithSettings[];
}) {
  const { t } = useTranslation();
  // const [activeTab, setActiveTab] = useState('home');
  const revalidateAccount = useRevalidatePersonalAccountDataQuery();
  const router = useRouter();
  const updateMemberImage = async (value: string) => {
    try {
      await updateUserSettings(id, { picture_url: value });
      toast.success('Success', {
        description: t('account:updateProfileSuccess'),
      });
      await revalidateAccount(id);
      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description: t('account:updateProfileError'),
      });
    }
  };

  const updateMemberName = async (value: string) => {
    try {
      await updateUserSettings(id, { name: value });
      toast.success('Success', {
        description: t('account:updateProfileSuccess'),
      });
    } catch (error) {
      toast.error('Error', {
        description: t('account:updateProfileError'),
      });
    }
  };

  const account = {
    id: user.id,
    name: user.settings?.name ?? user.name,
    email: user.email ?? '',
    picture_url: user.settings?.picture_url ?? '',
  };

  const bucketStorage = {
    id,
    name: 'account_image',
    identifier: 'team_member',
  };

  const views: ViewsMap = new Map([
    [
      t('team:member.tabs.home'),
      <HomeSection
        key={t('team:member.tabs.home')}
        agencyMembers={agencyMembers}
      />,
    ],
    [
      t('team:member:tabs.reviews'),
      <ReviewsSection
        key={t('team:member:tabs.reviews')}
        userId={id}
        userRole={userRole}
      />,
    ],
  ]);

  const rolesThatCanEdit = new Set([
    'agency_member',
    'agency_project_manager',
    'agency_owner',
  ]);

  return (
    <AgencyStatusesProvider initialStatuses={agencyStatuses} agencyMembers={agencyMembers}>
      <Section views={views} state={null}>
        <Section.Header
          id={id}
          currentUserRole={userRole}
          account={account}
          bucketStorage={bucketStorage}

          emailLabel="Email"
          controllers={{
            onUpdateAccountImage: updateMemberImage,
            onUpdateAccountName: updateMemberName,
          }}
          rolesThatCanEdit={rolesThatCanEdit}
        />
        <Section.Tabs defaultActiveTab={t('team:member.tabs.home')} />
      </Section>
    </AgencyStatusesProvider>
  );
}
