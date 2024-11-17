import { useEffect, useState } from 'react';

import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Spinner } from '@kit/ui/spinner';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { Account } from '~/lib/account.types';
import { getOrderAgencyMembers } from '~/team-accounts/src/server/actions/orders/get/get-order';

import deduceNameFromEmail from '../utils/deduce-name-from-email';

interface CalendarSectionProps {
  orderId: string;
  orderAgencyId: string;
  userRole: string;
}

function CalendarSection({
  orderId,
  orderAgencyId,
  userRole,
}: CalendarSectionProps) {
  const [loading, setLoading] = useState(true);
  const { data: orderAgencyMembers } = useQuery<Account.Type[]>({
    queryKey: ['order-agency-members', orderId],
    queryFn: async () => {
      setLoading(true);
      const data = await getOrderAgencyMembers(orderAgencyId, Number(orderId));
      setLoading(false);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled:
      userRole === 'agency_owner' ||
      userRole === 'agency_member' ||
      userRole === 'agency_project_manager',
  }) as UseQueryResult<Account.Type[], unknown>;

  const [activeTab, setActiveTab] = useState<string>(
    orderAgencyMembers?.[0]?.id ?? '',
  );

  useEffect(() => {
    setActiveTab(orderAgencyMembers?.[0]?.id ?? '');
  }, [orderAgencyMembers]);

  return (
    <div>
      <p className="mb-2 font-semibold">Agendas disponibles</p>
      {loading ? (
        <Spinner className="h-7 w-7" />
      ) : (
        <Tabs
          className="flex h-full max-h-full min-h-0 flex-col"
          value={activeTab}
          onValueChange={(value: string) => {
            setActiveTab(value as 'activity' | 'details');
          }}
        >
          <TabsList className="flex w-fit gap-2 bg-transparent">
            {orderAgencyMembers?.map((member) =>
              member.calendar ? (
                <ThemedTabTrigger
                  className="flex items-center rounded-full p-0"
                  key={member.id}
                  value={member.id}
                  activeTab={activeTab}
                  option={member.id}
                >
                  <Avatar className="scale-50 p-0">
                    <AvatarImage src={member.picture_url ?? ''} />
                    <AvatarFallback>
                      {member.name.charAt(0).toUpperCase() || 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mr-3">
                    {deduceNameFromEmail(member.email ?? '')}
                  </p>
                </ThemedTabTrigger>
              ) : null,
            )}
          </TabsList>
          {orderAgencyMembers?.map((member) =>
            member.calendar ? (
              <TabsContent key={member.id} value={member.id}>
                <div className="max-h-screen w-full">
                  <div className="aspect-[4/3] h-full max-h-96 w-full overflow-auto lg:max-h-[30rem]">
                    <iframe
                      className="h-full w-full overflow-scroll"
                      src={member.calendar ?? ''}
                    ></iframe>
                  </div>
                </div>
              </TabsContent>
            ) : null,
          )}
        </Tabs>
      )}
    </div>
  );
}

export default CalendarSection;
