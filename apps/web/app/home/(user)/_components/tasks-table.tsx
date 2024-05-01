'use client';

import { useFormStatus } from 'react-dom';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/enhanced-data-table';
import { Trans } from '@kit/ui/trans';

import { deleteTaskAction } from '~/(dashboard)/home/(user)/_lib/server/server-actions';
import { Database } from '~/lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];

export function TasksTable(props: {
  data: Task[];
  page: number;
  pageSize: number;
  pageCount: number;
}) {
  const columns = useGetColumns();

  return (
    <div>
      <DataTable {...props} columns={columns} />
    </div>
  );
}

function useGetColumns(): ColumnDef<Task>[] {
  const { t } = useTranslation('tasks');

  return [
    {
      header: t('task'),
      cell: ({ row }) => (
        <Link
          className={'hover:underline'}
          href={`/home/tasks/${row.original.id}`}
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      header: t('createdAt'),
      accessorKey: 'created_at',
    },
    {
      header: t('updatedAt'),
      accessorKey: 'updated_at',
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div className={'flex justify-end space-x-2'}>
            <Link href={`/home/tasks/${id}`}>
              <Button variant={'ghost'} size={'icon'}>
                <Pencil className={'h-4'} />
              </Button>
            </Link>

            <ConfirmDeleteTask taskId={id}>
              <Button variant={'ghost'} size={'icon'}>
                <Trash className={'h-4'} />
              </Button>
            </ConfirmDeleteTask>
          </div>
        );
      },
    },
  ];
}

function ConfirmDeleteTask(
  props: React.PropsWithChildren<{
    taskId: string;
  }>,
) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <Trans i18nKey={'tasks:deleteTask'} />
        </AlertDialogHeader>

        <AlertDialogDescription>
          <Trans i18nKey={'tasks:deleteTaskConfirmation'} />
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>

          <form action={deleteTaskAction}>
            <input type="hidden" name={'id'} value={props.taskId} />

            <SubmitButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} variant={'destructive'}>
      <Trans i18nKey={'tasks:deleteTask'} />
    </Button>
  );
}
