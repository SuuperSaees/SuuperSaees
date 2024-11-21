import React, { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Pen } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import {
  Dialog,
  DialogContent,
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
import { Input } from '@kit/ui/input';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { useTranslation } from 'react-i18next';

const mockRoles = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Moderator', value: 'moderator' },
];

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'fullName must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.string().min(2, {
    message: 'Role must be at least 2 characters.',
  }),
});

function EditUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const {t} = useTranslation('clients');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: '',
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log(values);
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      form.reset();
    }
    setIsOpen(open);
  }, [form]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="w-full text-left"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <div className="flex items-center gap-2">
            <Pen className="h-4 w-4" />
            {t('editUser.edit')}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <p className="text-base font-semibold">{t('editUser.editUserInfo')}</p>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="flex w-full items-center gap-7">
                  <Avatar className="mt-[12px] scale-150 p-0">
                    <AvatarFallback>{'T'}</AvatarFallback>
                  </Avatar>
                  <FormControl className="mt-0 w-full">
                    <div>
                      <FormLabel aria-required={true}>
                        {t('editUser.fullName')}
                      </FormLabel>
                      <Input required={true} placeholder="Enter full name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl className="w-full">
                    <div className="my-4">
                      <FormLabel aria-required={true}>{t('editUser.email')}</FormLabel>
                      <Input required={true} type="email" placeholder="Enter email" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('editUser.role')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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

