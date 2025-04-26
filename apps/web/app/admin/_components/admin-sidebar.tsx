import { User } from '@supabase/supabase-js';

import { Home, Users, Building } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
} from '@kit/ui/sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';

export function AdminSidebar(props: { user: User }) {
  return (
    <Sidebar className='text-sm'>
      <SidebarContent className={'py-4'}>
        <AppLogo href={'/admin'} />
      </SidebarContent>

      <SidebarContent className={'mt-5'}>
        <SidebarGroup label={'Admin'} collapsible={false}>
          <SidebarItem end path={'/admin'} Icon={<Home className={'h-4'} />}>
            Home
          </SidebarItem>

          <SidebarItem
            path={'/admin/accounts'}
            Icon={<Users className={'h-4'} />}
          >
            Accounts
          </SidebarItem>

          <SidebarItem
            path={'/admin/organizations'}
            Icon={<Building className={'h-4'} />}
          >
            Organizations
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>

      <SidebarContent className={'absolute bottom-4'}>
        <ProfileAccountDropdownContainer user={props.user} collapsed={false} />
      </SidebarContent>
    </Sidebar>
  );
}
