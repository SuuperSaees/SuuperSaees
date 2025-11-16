'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { addClientMember } from 'node_modules/@kit/team-accounts/src/server/actions/clients/create/create-clients';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
// import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';
import { Trans } from '@kit/ui/trans';
import { handleResponse } from '~/lib/response/handle-response';

type InviteModel = ReturnType<typeof createEmptyInviteModel>;

/**
 * The maximum number of invites that can be sent at once.
 * Useful to avoid spamming the server with too large payloads
 */
const MAX_INVITES = 5;

export function InviteClientMembersDialogContainer({
  clientOrganizationId,
  children,
  open,
  onOpenChange,
}: React.PropsWithChildren<{
  clientOrganizationId: string;
  userRoleHierarchy: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  const [pending, startTransition] = useTransition();
  const { t } = useTranslation('responses');
  const queryClient = useQueryClient();

  let host = 'localhost:3000';
  host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';

  const inviteClientMembers = useMutation({
    mutationFn: async ({
      email,
      clientOrganizationId,
    }: {
      email: string;
      clientOrganizationId: string;
    }) => await addClientMember({ email, clientOrganizationId, baseUrl: `${host === 'localhost:3000' ? 'http://' : 'https://'}${host}` }),
  });

  const onSubmit = ({ invitations }: { invitations: InviteModel[] }) => {
    // Use transition to avoid blocking the UI thread

    startTransition(async () => {
      // Use Promise.all to wait for all mutations
      await Promise.all(
        invitations.map(({ email }) =>
          inviteClientMembers.mutateAsync({ email, clientOrganizationId }),
        ),
      )
        .then(async (res) => {
          await handleResponse(res[0], 'clients', t);
          // toast.success(t('clients:organizations.members.invite.success'));

          await queryClient.invalidateQueries({
            queryKey: ['clientsWithOrganizations'],
          });
        }).catch(() => null);
    });

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'clients:organizations.members.invite.title'} />
          </DialogTitle>

          <DialogDescription>
            <Trans
              i18nKey={'clients:organizations.members.invite.description'}
            />
          </DialogDescription>
        </DialogHeader>

        <InviteClientMembersForm pending={pending} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}

const inviteSchema = z.object({
  email: z.string().email(),
});

export const inviteMembersSchema = z
  .object({
    invitations: inviteSchema.array().min(1).max(5),
  })
  .refine(
    (data) => {
      const emails = data.invitations.map((member) =>
        member.email.toLowerCase(),
      );

      const uniqueEmails = new Set(emails);

      return emails.length === uniqueEmails.size;
    },
    {
      message: 'Duplicate emails are not allowed',
      path: ['invitations'],
    },
  );

function InviteClientMembersForm({
  onSubmit,
  pending,
}: {
  onSubmit: (data: { invitations: InviteModel[] }) => void;
  pending: boolean;
}) {
  const { t } = useTranslation('team');

  const form = useForm({
    resolver: zodResolver(inviteMembersSchema),
    shouldUseNativeValidation: true,
    reValidateMode: 'onSubmit',
    defaultValues: {
      invitations: [createEmptyInviteModel()],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: 'invitations',
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-8'}
        data-test={'invite-members-form'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col space-y-4">
          {fieldArray.fields.map((field, index) => {
            const isFirst = index === 0;

            const emailInputName = `invitations.${index}.email` as const;

            return (
              <div data-test={'invite-member-form-item'} key={field.id}>
                <div className={'flex items-end space-x-0.5 md:space-x-2'}>
                  <div className={'w-7/12'}>
                    <FormField
                      name={emailInputName}
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <If condition={isFirst}>
                              <FormLabel>{t('emailLabel')}</FormLabel>
                            </If>

                            <FormControl>
                              <ThemedInput
                                data-test={'invite-email-input'}
                                placeholder={t('emailPlaceholder')}
                                type="email"
                                required
                                className="focus-visible:ring-1 focus-visible:ring-brand"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className={'flex w-[40px] justify-end'}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={'ghost'}
                            size={'icon'}
                            type={'button'}
                            disabled={fieldArray.fields.length <= 1}
                            data-test={'remove-invite-button'}
                            aria-label={t('removeInviteButtonLabel')}
                            onClick={() => {
                              fieldArray.remove(index);
                              form.clearErrors(emailInputName);
                            }}
                          >
                            <X className={'h-4 lg:h-5'} />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          {t('removeInviteButtonLabel')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            );
          })}

          <If condition={fieldArray.fields.length < MAX_INVITES}>
            <div>
              <Button
                data-test={'add-new-invite-button'}
                type={'button'}
                variant={'link'}
                size={'sm'}
                disabled={pending}
                onClick={() => {
                  fieldArray.append(createEmptyInviteModel());
                }}
              >
                <Plus className={'mr-1 h-3'} />

                <span>
                  <Trans
                    i18nKey={'clients:organizations.members.invite.addAnother'}
                  />
                </span>
              </Button>
            </div>
          </If>
        </div>

        <ThemedButton type={'submit'} disabled={pending}>
          <Trans
            i18nKey={
              pending
                ? 'clients:organizations.members.invite.inviting'
                : 'clients:organizations.members.invite.sendInvite'
            }
          />
        </ThemedButton>
      </form>
    </Form>
  );
}

function createEmptyInviteModel() {
  return { email: '' };
}
