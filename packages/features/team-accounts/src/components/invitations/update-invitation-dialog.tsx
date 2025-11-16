import { useState, useTransition } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { RoleSchema } from '../../schema/update-member-role.schema';
import { updateInvitationAction } from '../../server/actions/team-invitations-server-actions';
import { MembershipRoleSelector } from '../members/membership-role-selector';
import { RolesDataProvider } from '../members/roles-data-provider';

type Role = string;

export function UpdateInvitationDialog({
  isOpen,
  setIsOpen,
  invitationId,
  userRole,
  userRoleHierarchy,
  queryKey,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  invitationId: number;
  userRole: Role;
  userRoleHierarchy: number;
  queryKey?: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'team:updateMemberRoleModalHeading'} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={'team:updateMemberRoleModalDescription'} />
          </DialogDescription>
        </DialogHeader>

        <UpdateInvitationForm
          invitationId={invitationId}
          userRole={userRole}
          userRoleHierarchy={userRoleHierarchy}
          setIsOpen={setIsOpen}
          queryKey={queryKey}
        />
      </DialogContent>
    </Dialog>
  );
}

function UpdateInvitationForm({
  invitationId,
  userRole,
  userRoleHierarchy,
  setIsOpen,
  queryKey,
}: React.PropsWithChildren<{
  invitationId: number;
  userRole: Role;
  userRoleHierarchy: number;
  setIsOpen: (isOpen: boolean) => void;
  queryKey?: string;
}>) {
  const { t } = useTranslation('team');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();
  const queryClient = useQueryClient();

  const updateInvitationMutation = useMutation({
    mutationFn: async ({ role }: { role: Role }) => {
      return await updateInvitationAction({
        invitationId,
        role,
      });
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

  const onSubmit = ({ role }: { role: Role }) => {
    if (!queryKey) {
      startTransition(async () => {
        try {
          await updateInvitationAction({
            invitationId,
            role,
          });

          setIsOpen(false);
        } catch (e) {
          setError(true);
        }
      });
    } else {
      updateInvitationMutation.mutate({ role });
    }
  };

  const form = useForm({
    resolver: zodResolver(
      RoleSchema.refine(
        (data) => {
          return data.role !== userRole;
        },
        {
          message: t('roleMustBeDifferent'),
          path: ['role'],
        },
      ),
    ),
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: {
      role: userRole,
    },
  });

  const isLoading = queryKey ? updateInvitationMutation.isPending : pending;

  return (
    <Form {...form}>
      <form
        data-test={'update-invitation-form'}
        onSubmit={form.handleSubmit(onSubmit)}
        className={'flex flex-col space-y-6'}
      >
        <If condition={error}>
          <UpdateRoleErrorAlert />
        </If>

        <FormField
          name={'role'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'team:roleLabel'} />
                </FormLabel>

                <FormControl>
                  <RolesDataProvider maxRoleHierarchy={userRoleHierarchy}>
                    {(roles) => (
                      <MembershipRoleSelector
                        roles={roles}
                        currentUserRole={userRole}
                        value={field.value}
                        onChange={(newRole) =>
                          form.setValue(field.name, newRole)
                        }
                      />
                    )}
                  </RolesDataProvider>
                </FormControl>

                <FormDescription>
                  <Trans i18nKey={'team:updateRoleDescription'} />
                </FormDescription>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button type={'submit'} disabled={isLoading}>
          <Trans i18nKey={'team:updateRoleSubmitLabel'} />
        </Button>
      </form>
    </Form>
  );
}

function UpdateRoleErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'team:updateRoleErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'team:updateRoleErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
