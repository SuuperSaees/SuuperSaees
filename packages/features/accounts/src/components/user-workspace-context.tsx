'use client';

import { createContext } from 'react';

import { User } from '@supabase/supabase-js';

import { Tables } from '@kit/supabase/database';
import { InvoiceSettings } from '../../../../../apps/web/app/server/actions/invoices/type-guards';
import { CreditsConfig } from '../server/type-guard';

export interface UserWorkspace {
  accounts: Array<{
    label: string | null;
    value: string | null;
    image: string | null;
  }>;

  workspace: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    subscription_status: Tables<'subscriptions'>['status'] | null;
    role: string | null;
  };
  organization: {
    name: string | null;
    slug: string | null;
    picture_url: string | null;
    id: string | null;
    statuses: {
      agency_id: string | null;
      created_at: string | null;
      deleted_on: string | null;
      id: number | null;
      position: number | null;
    }[]
    tags: {
      color: string | null;
      created_at: string | null;
      deleted_on: string | null;
      id: string | null;
      name: string | null;
    }[]
    settings: {
      billing: InvoiceSettings;
      credits: CreditsConfig;
    }
  };

  agency: {
    name: string | null;
    slug: string | null;
    picture_url: string | null;
    id: string | null;
    statuses: {
      agency_id: string | null;
      created_at: string | null;
      deleted_on: string | null;
      id: number | null;
      position: number | null;
      status_color: string | null;
      status_name: string | null;
    }[]
    tags: {
      color: string | null;
      created_at: string | null;
      deleted_on: string | null;
      id: string | null;
      name: string | null;
      organization_id: string | null;
      updated_at: string | null;
    }[]
  };
  pinnedOrganizations: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  }[];
  user: User;
}

export const UserWorkspaceContext = createContext<UserWorkspace>(
  {} as UserWorkspace,
);

export function UserWorkspaceContextProvider(
  props: React.PropsWithChildren<{
    value: UserWorkspace;
  }>,
) {
  return (
    <UserWorkspaceContext.Provider value={props.value}>
      {props.children}
    </UserWorkspaceContext.Provider>
  );
}
