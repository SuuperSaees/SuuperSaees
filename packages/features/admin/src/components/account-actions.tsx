'use client';

import Link from 'next/link';
import { EllipsisVertical, Eye, User, Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';

import { AdminDeleteAccountDialog } from './admin-delete-account-dialog';
import { AdminDeleteUserDialog } from './admin-delete-user-dialog';
import { AdminImpersonateUserDialog } from './admin-impersonate-user-dialog';

type AccountActionsProps = {
  id: string;
  isPersonalAccount: boolean;
};

export function AccountActions({ id, isPersonalAccount }: AccountActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuLabel className="text-xs text-gray-500 px-2 pb-1.5">Actions</DropdownMenuLabel>

        <DropdownMenuItem className="cursor-pointer rounded-md flex items-center h-9 px-2 py-1.5 hover:bg-gray-50">
          <Link
            className="flex w-full items-center"
            href={ isPersonalAccount ? `/admin/accounts/${id}` : `/admin/organizations/${id}`}
          >
            <Eye className="h-4 w-4 mr-2 text-gray-500" />
            <span>View Account Details</span>
          </Link>
        </DropdownMenuItem>

        <If condition={isPersonalAccount}>
          <AdminImpersonateUserDialog userId={id}>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} 
              className="cursor-pointer rounded-md flex items-center h-9 px-2 py-1.5 hover:bg-gray-50"
            >
              <User className="h-4 w-4 mr-2 text-amber-500" />
              <span>Impersonate User</span>
            </DropdownMenuItem>
          </AdminImpersonateUserDialog>

          <DropdownMenuSeparator className="my-1 bg-gray-200" />

          <AdminDeleteUserDialog userId={id}>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} 
              className="cursor-pointer rounded-md flex items-center h-9 px-2 py-1.5 hover:bg-red-50 text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Delete Personal Account</span>
            </DropdownMenuItem>
          </AdminDeleteUserDialog>
        </If>

        <If condition={!isPersonalAccount}>
          <DropdownMenuSeparator className="my-1 bg-gray-200" />
          
          <AdminDeleteAccountDialog accountId={id}>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} 
              className="cursor-pointer rounded-md flex items-center h-9 px-2 py-1.5 hover:bg-red-50 text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Delete Team Account</span>
            </DropdownMenuItem>
          </AdminDeleteAccountDialog>
        </If>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 