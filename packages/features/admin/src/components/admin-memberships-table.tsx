'use client';

import Link from 'next/link';
import { CalendarIcon, RefreshCw, Users } from 'lucide-react';

import { ColumnDef } from '@tanstack/react-table';

import { Database } from '@kit/supabase/database';
import { DataTable } from '@kit/ui/enhanced-data-table';
import { Badge } from '@kit/ui/badge';

type Membership =
  Database['public']['Tables']['accounts_memberships']['Row'] & {
    account: {
      id: string;
      name: string;
    };
  };

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

export function AdminMembershipsTable(props: { memberships: Membership[] }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <DataTable data={props.memberships} columns={getColumns()} />
    </div>
  );
}

function getColumns(): ColumnDef<Membership>[] {
  return [
    {
      header: 'Team',
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Users className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
            <Link
              className="font-medium hover:underline"
              href={`/admin/accounts/${row.original.organization_id}`}
            >
              {row.original.account.name}
            </Link>
          </div>
        );
      },
    },
    {
      header: 'Organization ID',
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="text-xs font-mono text-muted-foreground">{row.original.organization_id}</span>
          </div>
        );
      },
    },
    {
      header: 'Role',
      accessorKey: 'account_role',
      cell: ({ row }) => {
        return (
          <Badge 
            variant="outline"
            className="capitalize px-2 py-0.5"
          >
            {row.original.account_role}
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
