'use client';

import Link from 'next/link';
import { CalendarIcon, RefreshCw } from 'lucide-react';

import { ColumnDef } from '@tanstack/react-table';

import { Database } from '@kit/supabase/database';
import { DataTable } from '@kit/ui/enhanced-data-table';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Badge } from '@kit/ui/badge';

type Memberships =
  Database['public']['Functions']['get_account_members']['Returns'][number];

// Helper function to safely format dates
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '-';
  }
}

export function AdminMembersTable(props: { members: Memberships[] }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <DataTable data={props.members} columns={getColumns()} />
    </div>
  );
}

function getColumns(): ColumnDef<Memberships>[] {
  return [
    {
      header: 'Name',
      cell: ({ row }) => {
        const name = row.original.name ?? row.original.email;

        return (
          <div className="flex items-center space-x-2">
            <div>
              <ProfileAvatar
                pictureUrl={row.original.picture_url}
                displayName={name}
              />
            </div>

            <Link
              className="font-medium hover:underline"
              href={`/admin/accounts/${row.original.id}`}
            >
              <span>{name}</span>
            </Link>
          </div>
        );
      },
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => {
        return <span className="text-muted-foreground">{row.original.email}</span>;
      },
    },
    {
      header: 'Role',
      cell: ({ row }) => {
        return (
          <Badge 
            variant="outline"
            className="capitalize px-2 py-0.5"
          >
            {row.original.role}
          </Badge>
        );
      },
    },
    {
      header: 'Created At',
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const dateStr = formatDate(row.original.created_at);
        return (
          <div className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-sm">{dateStr}</span>
          </div>
        );
      },
    },
    {
      header: 'Updated At',
      accessorKey: 'updated_at',
      cell: ({ row }) => {
        const dateStr = formatDate(row.original.updated_at);
        // Just show a dash if the date is the same as created_at
        if (row.original.updated_at === row.original.created_at) {
          return <span>-</span>;
        }
        
        return (
          <div className="flex items-center">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-sm">{dateStr}</span>
          </div>
        );
      },
    },
  ];
}
