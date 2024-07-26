'use client';

import { useMemo, useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Database } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';

import { RemoveMemberDialog } from './remove-member-dialog';
import { RoleBadge } from './role-badge';
import { TransferOwnershipDialog } from './transfer-ownership-dialog';
import { UpdateMemberRoleDialog } from './update-member-role-dialog';
import { Search } from 'lucide-react';


type Members =
  Database['public']['Functions']['get_account_members']['Returns'];

interface Permissions {
  canUpdateRole: (roleHierarchy: number) => boolean;
  canRemoveFromAccount: (roleHierarchy: number) => boolean;
  canTransferOwnership: boolean;
}



type ClientsTableProps = {
  clients: {
    id: string
    created_at: string
    name: string
    client_organization: string
    email: string
    role: string
    propietary_organization: string
    propietary_organization_id: string
  }[];
}


export function ClientsTable({
  clients,
}: ClientsTableProps) {

  console.log('Clients props:', clients);

  return (
    <div>
      <h1 className="text-xl font-bold">Client Data:</h1>
      {clients.map((client, index) => (
        <div key={index} className="my-4 p-4 border border-gray-200 rounded">
          <h2 className="text-lg font-semibold">Client {index + 1}</h2>
          <p><strong>ID:</strong> {client.id}</p>
          <p><strong>Created At:</strong> {client.created_at}</p>
          <p><strong>Name:</strong> {client.name}</p>
          <p><strong>Client Organization:</strong> {client.client_organization}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Role:</strong> {client.role}</p>
          <p><strong>Propietary Organization:</strong> {client.propietary_organization}</p>
          <p><strong>Propietary Organization ID:</strong> {client.propietary_organization_id}</p>
        </div>
      ))}
    </div>
  )
}

