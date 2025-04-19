'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarIcon, RefreshCw, Users, User } from 'lucide-react';

import { Database } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';

import { AccountActions } from './account-actions';

type Account = Database['public']['Tables']['accounts']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

export function getAccountColumns({ isPersonalAccount }: { isPersonalAccount: boolean }): ColumnDef<Account | Organization>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <Link
            className="font-medium hover:underline flex items-center"
            href={isPersonalAccount ? `/admin/accounts/${row.original.id}` : `/admin/organizations/${row.original.id}`}
          >
            {row.original.name}
          </Link>
        );
      },
    },
    {
      id: isPersonalAccount ? 'email' : 'owner_id',
      header: isPersonalAccount ? 'Email' : 'Owner',
      accessorKey: 'id',
      cell: ({ row }) => {
        const email = isPersonalAccount 
          ? (row.original as Account).email 
          : (row.original as Organization).owner_id;
        return <span className="text-muted-foreground">{email}</span>;
      },
    },
    {
      id: 'type',
      header: 'Type',
      cell: () => {
        const isPersonal = isPersonalAccount;
        return (
          <Badge 
            variant="outline"
            className={`${isPersonal ? "border-purple-200 bg-purple-50 text-purple-700" : "border-blue-200 bg-blue-50 text-blue-700"} px-2 py-0.5`}
          >
            {isPersonal ? (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>Personal</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>Team</span>
              </div>
            )}
          </Badge>
        );
      },
    },
    {
      id: 'created_at',
      header: 'Created At',
      accessorKey: 'created_at',
      cell: ({ row }) => {
        // Format the date to be more readable
        const dateStr = row.original.created_at;
        if (!dateStr) return <span>-</span>;
        
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return (
          <div className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-sm">{formattedDate}</span>
          </div>
        );
      },
    },
    {
      id: 'updated_at',
      header: 'Updated At',
      accessorKey: 'updated_at',
      cell: ({ row }) => {
        // Format the date to be more readable
        const dateStr = row.original.updated_at;
        if (!dateStr) return <span>-</span>;
        
        // Just show a dash if the date is the same as created_at
        if (dateStr === row.original.created_at) {
          return <span>-</span>;
        }
        
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return (
          <div className="flex items-center">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-sm">{formattedDate}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const id = row.original.id;

        return <AccountActions id={id} isPersonalAccount={isPersonalAccount} />;
      },
    },
  ];
} 