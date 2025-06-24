import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Spinner } from '@kit/ui/spinner';

import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { getAccountSettings } from '../../server/actions/accounts/get/get-account';
import {
  updateUserAccount,
  updateUserRole,
} from '../../server/actions/members/update/update-account';

interface EditUserDialogProps {
  userId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  name: string;
  email: string;
  currentUserRole?: string;
  userRole?: string;
  isLoading: boolean;
  isPending: boolean;
}

function EditUserDialog({
  userId,
  name,
  email,
  isOpen,
  setIsOpen,
  currentUserRole,
  userRole,
  isLoading,
  isPending
}: EditUserDialogProps) {
  const { t } = useTranslation('clients');
  const router = useRouter();
  // const [localOpen, setLocalOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [roles, setRoles] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  const clientRoles = useMemo(
    () => [
      { value: 'client_member', label: t('clientMember') },
      { value: 'client_owner', label: t('clientOwner') },
    ],
    [t],
  );

  const agencyRoles = useMemo(() => {
    return [
        { value: 'agency_member', label: t('agencyMember') },
        { value: 'agency_project_manager', label: t('agencyProjectManager') },
      ];
  }, [currentUserRole, t]);

  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', userId],
    queryFn: async () => await getAccountSettings(userId),
    staleTime: 0,
    enabled: isOpen,
    // retry: 1,
  });

  const formSchema = z.object({
    fullName: z.string().min(3, {
      message: t('editUser.badInputFullName'),
    }),
    // email: z.string().email({
    //   message: t('editUser.badInputEmail'),
    // }),
    role: z
      .string()
      .refine((value) => roles.some((role) => role.value === value), {
        message: t('editUser.badInputRole'),
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      // email: email,
      role: '',
    },
  });

  const host = typeof window !== 'undefined' ? window.location.host : '';

  const mutateUser = useMutation({
    mutationFn: async () => {
      // await updateUserEmail(userId, form.getValues('email'), undefined, true);
      if (name !== form.getValues('fullName')) {
        await updateUserAccount(
          {
            name: form.getValues('fullName'),
            // email: form.getValues('email'),
          },
          userId,
          undefined,
          true,
        );
      }
      if (userRole !== form.getValues('role')) {
        await updateUserRole(userId, form.getValues('role'), undefined, true, host);
      }
    },
    onSuccess: () => {
      toast.success(t('success'), {
        description: t('editUser.successEdit'),
      });
      void queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error) => {
      console.log(error);
      toast.error('Error', {
        description: t('editUser.failureEdit'),
      });
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    mutateUser.mutate();
    setIsOpen(false);
    router.refresh();

  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        form.reset();
      }
      setIsOpen(open);
    },
    [form],
  );

  useEffect(() => {
    if (userRole === 'agency_owner' || userRole === 'agency_project_manager' || userRole === 'agency_member') {
      setRoles(agencyRoles);
    } else {
      setRoles(clientRoles);
    }
    if (isOpen) {
      form.setValue('fullName', name);
      if (userRole) {
        form.setValue('role', userRole);
      }
    }
  }, [isOpen, form, name, userRole, agencyRoles, clientRoles]);


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <p className="text-base font-semibold">
              {t('editUser.editUserInfo')}
            </p>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="flex w-full items-center gap-7">
                  <Avatar className="mt-[12px] scale-150 p-0">
                    <AvatarImage
                      className="object-contain"
                      src={userSettings?.picture_url ?? ''}
                    />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <FormControl className="mt-0 w-full">
                      <div>
                        <FormLabel>{t('editUser.fullName')}</FormLabel>
                        <Input
                          placeholder="Enter full name"
                          type="text"
                          {...field}
                          className="mt-2"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="mt-4" />
                  </div>
                </FormItem>
              )}
            />
           
            {
              //If my role is not agency_owner and the user's role is agency_owner, I cannot change his role
              //If my role is agency_owner and the user's role is agency_owner, I cannot change his role either. This is used to disable role switching for owners and prevent errors where the organization might end up without an owner
              (currentUserRole !== 'agency_owner' && userRole ==='agency_owner') || (currentUserRole === 'agency_owner' && userRole ==='agency_owner') ? null : 
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('editUser.role')}</FormLabel>
                  {isLoading || isPending ? (
                    <Spinner className="h-5" />
                      ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('editUser.badInputRole')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            }
            
            <ThemedButton className="w-full" type="submit">
              {t('editUser.saveChanges')}
            </ThemedButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserDialog;
