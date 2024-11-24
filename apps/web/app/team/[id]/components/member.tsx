'use client';

// import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Section } from '~/contexts/section';
import { ViewsMap } from '~/contexts/types/section.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { Order } from '~/lib/order.types';
import { AgencyStatusesProvider } from '~/orders/components/context/agency-statuses-context';
import { updateUserSettings } from '~/team-accounts/src/server/actions/members/update/update-account';

// import Header from '../../../components/accounts/header';
import HomeSection from './home-section';

export default function Member({
  id,
  userRole,
  user,
  orders,
  agencyStatuses,
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
}) {
  const { t } = useTranslation();
  // const [activeTab, setActiveTab] = useState('home');

  const updateMemberImage = async (value: string) => {
    try {
      await updateUserSettings(id, { picture_url: value });
      toast.success('Success', {
        description: t('account:updateProfileSuccess'),
      });
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
    ['home', <HomeSection key={'home'} memberOrders={orders} />],
  ]);

  const rolesThatCanEdit = new Set([
    'agency_member',
    'agency_project_manager',
    'agency_owner',
  ]);

  return (
    <AgencyStatusesProvider initialStatuses={agencyStatuses}>
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
        <Section.Tabs defaultActiveTab={'home'} />
      </Section>
    </AgencyStatusesProvider>
  );
}
