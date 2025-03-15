import { useEffect, useState } from 'react';

import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { UserWithSettings } from '~/lib/account.types';
import { useTranslation } from 'react-i18next';

interface CalendarSectionProps {
  orderAgencyMembers: UserWithSettings[];
}

function CalendarSection({
  orderAgencyMembers,
}: CalendarSectionProps) {
  const {t} = useTranslation('orders');
  const [activeTab, setActiveTab] = useState<string>(
    orderAgencyMembers?.[0]?.id ?? '',
  );

  useEffect(() => {
    setActiveTab(orderAgencyMembers?.[0]?.id ?? '');
  }, [orderAgencyMembers]);

  return (
    <div>
      <p className="mb-2 font-bold">{t('calendarTitle')}</p>
      {orderAgencyMembers.every((member) => !member.user_settings?.calendar) ? (
        <p>{t('calendarEmpty')}</p>
      ) : (
        <Tabs
          className="flex h-full max-h-full min-h-0 flex-col"
          value={activeTab}
          onValueChange={(value: string) => {
            setActiveTab(value);
          }}
        >
          <TabsList className="flex w-fit gap-2 bg-transparent">
            {orderAgencyMembers?.map((member) =>
              member.user_settings?.calendar ? (
                <ThemedTabTrigger
                  className="flex items-center rounded-full p-0"
                  key={member.id}
                  value={member.id}
                  activeTab={activeTab}
                  option={member.id}
                >
                  <Avatar className="scale-50 p-0">
                    <AvatarImage src={member.user_settings?.picture_url ?? ''} />
                    <AvatarFallback>
                      {member.name.charAt(0).toUpperCase() || 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mr-3">
                    {member.user_settings?.name ?? member.name ?? member.email ?? ''}
                  </p>
                </ThemedTabTrigger>
              ) : null,
            )}
          </TabsList>
          {orderAgencyMembers?.map((member) =>
            member.user_settings?.calendar ? (
              <TabsContent key={member.id} value={member.id}>
                <div className="max-h-screen w-full">
                  <div className="aspect-[4/3] h-full max-h-96 w-full overflow-auto lg:max-h-[30rem]">
                    <iframe
                      className="h-full w-full overflow-scroll"
                      src={member.user_settings?.calendar ?? ''}
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