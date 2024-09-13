'use client';

import React from 'react';



import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';



import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Separator } from '@kit/ui/separator';

import { ThemedButton } from '../../../../../../accounts/src/components/ui/button-themed-with-settings';
// import { MembershipRoleSelector } from '../../../../components/clients/membership-role-selector';
// import { RolesDataProvider } from '../../../../components/clients/roles-data-provider';
import { createClient } from './create-clients';


const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  email: z.string().email(),
  role: z.string().min(2).max(50),
});

const CreateClientDialog = () => {
  // const [selectedRole, setSelectedRole] = useState('');
  const { t } = useTranslation('clients');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'client_owner',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newClient = { ...values };
      // delete newClient?.role;
      await createClient({ client: newClient, role: values.role });
      // console.log('values client', values);
      // sendClientInvitations(
      //   [{ email: values.email, role: selectedRole }],
      //   client?.slug ?? '',
      // );
      toast.success('success', {
        description: 'Client created successfully',
      });
      window.location.reload();
    } catch (error) {
      toast.error('error', {
        description: 'Something went wrong while creating the client',
      });
    }
  }

  // const handleRoleSelect = (role: string) => {
  //   setSelectedRole(role);
  //   form.setValue('role', role);
  // };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <ThemedButton>{t('createClient')}</ThemedButton>
        </AlertDialogTrigger>
        <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="flex w-full items-center justify-between">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('createClient')}</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogCancel className="font-bold text-red-500 hover:text-red-700">
              X
            </AlertDialogCancel>
          </div>
          <AlertDialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('nameLabel')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clientEmail')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('emailLabel')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('organizationName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('organizationLabelInput')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('roleSelection')}</FormLabel>
                      <FormControl>
                        <Input className="hidden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                {/* <RolesDataProvider maxRoleHierarchy={5}>
                  {(roles) => {
                    return (
                      <FormField
                        name={'role'}
                        render={({ field }) => {
                          return (
                            <FormItem>
                              {/* <If condition={isFirst}> */}
                {/* <FormLabel>{t('team:roleLabel')}</FormLabel> */}
                {/* </If> */}

                {/* <FormControl>
                                <MembershipRoleSelector
                                  roles={roles}
                                  value={field.value}
                                  onChange={(role) => {
                                    form.setValue(field.name, role);
                                  }}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem> */}
                {/* );
                        }}
                      /> */}
                {/* ); */}
                {/* }} */}
                {/* </RolesDataProvider> */}

                <Separator />
                <ThemedButton type="submit" className="w-full">
                  Crear cliente
                </ThemedButton>
              </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreateClientDialog;