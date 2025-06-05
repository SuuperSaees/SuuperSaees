import { useState, useTransition } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { deleteInvitationAction } from '../../server/actions/team-invitations-server-actions';

export function DeleteInvitationDialog({
  isOpen,
  setIsOpen,
  invitationId,
  queryKey,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  invitationId: number;
  queryKey?: string;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey="team:deleteInvitation" />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey="team:deleteInvitationDialogDescription" />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <DeleteInvitationForm
          setIsOpen={setIsOpen}
          invitationId={invitationId}
          queryKey={queryKey}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteInvitationForm({
  invitationId,
  setIsOpen,
  queryKey,
}: {
  invitationId: number;
  setIsOpen: (isOpen: boolean) => void;
  queryKey?: string;
}) {
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();
  const queryClient = useQueryClient();

  // Client-side mutation when queryKey is provided
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      return await deleteInvitationAction({ invitationId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKey],
      });
      setIsOpen(false);
    },
    onError: () => {
      setError(true);
    },
  });

  const onInvitationRemoved = () => {
    if (!queryKey) {
      // Server version (existing behavior)
      startTransition(async () => {
        try {
          await deleteInvitationAction({ invitationId });
          setIsOpen(false);
        } catch (e) {
          setError(true);
        }
      });
    } else {
      // Client version with mutation
      deleteInvitationMutation.mutate(invitationId);
    }
  };

  const isLoading = queryKey ? deleteInvitationMutation.isPending : isSubmitting;

  return (
    <form data-test={'delete-invitation-form'}>
      <div className={'flex flex-col space-y-6'}>
        <p className={'text-muted-foreground text-sm'}>
          <Trans i18nKey={'common:modalConfirmationQuestion'} />
        </p>

        <If condition={error}>
          <RemoveInvitationErrorAlert />
        </If>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>

          <Button
            type={'button'}
            variant={'destructive'}
            disabled={isLoading}
            onClick={onInvitationRemoved}
          >
            <Trans i18nKey={'team:deleteInvitation'} />
          </Button>
        </AlertDialogFooter>
      </div>
    </form>
  );
}

function RemoveInvitationErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'team:deleteInvitationErrorTitle'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'team:deleteInvitationErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
