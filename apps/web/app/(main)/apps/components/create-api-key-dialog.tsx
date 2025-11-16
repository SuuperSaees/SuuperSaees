// Dialog to create a new chat
'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
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
import { Spinner } from '@kit/ui/spinner';

import { getClientMembersForOrganization, getClientsOrganizations } from '~/team-accounts/src/server/actions/clients/get/get-clients';

import { Organization } from '~/lib/organization.types';

const apiKeyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organization_id: z.string().min(1, "Organization is required"),
  user_id: z.string().min(1, "User is required"),
  role: z.string().default("user"),
});

type FormValues = z.infer<typeof apiKeyFormSchema>;

interface CreateApiKeyDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onCreateApiKey: (data: FormValues) => Promise<boolean>;
}

export default function CreateApiKeyDialog({
  isOpen,
  setIsOpen,
  onCreateApiKey,
}: CreateApiKeyDialogProps) {
  const { t } = useTranslation('plugins');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization.TypeWithRelations[]>([]);
  const [members, setMembers] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    picture_url: string | null;
  }[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: '',
      organization_id: '',
      user_id: '',
      role: 'client_owner',
    },
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await getClientsOrganizations();
        setOrganizations(orgs ? orgs.map(org => ({
          ...org,
          deleted_on: null,
          public_data: {},
          updated_at: null,
          picture_url: org.picture_url ?? null
        })) : []);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    if (isOpen) {
      void fetchOrganizations();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedOrganization) return;
      
      try {
        const fetchedMembers = await getClientMembersForOrganization(selectedOrganization);

        setMembers(fetchedMembers?.map(member => ({
          ...member,
          email: member.email ?? '',
          role: member.role ?? 'client_owner',
          picture_url: member.picture_url ?? null
        })) ?? []);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    if (selectedOrganization) {
      void fetchMembers();
    }
  }, [selectedOrganization]);

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value;
    setSelectedOrganization(orgId);
    form.setValue('organization_id', orgId);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      data.role = members.find(member => member.id === data.user_id)?.role ?? 'client_owner';
      const success = await onCreateApiKey(data);
      if (success) {
        form.reset();
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogTitle>{t('generateNewApiKey')}</DialogTitle>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My API Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <select 
                className="w-full p-2 border rounded-md"
                onChange={handleOrganizationChange}
                value={selectedOrganization}
              >
                <option value="">Select an organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
              {form.formState.errors.organization_id && (
                <p className="text-sm text-red-500">{form.formState.errors.organization_id.message}</p>
              )}
            </FormItem>
            
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 border rounded-md"
                      {...field}
                      disabled={!selectedOrganization}
                    >
                      <option value="">Select a user</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name || member.email}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
             
              <ThemedButton 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  'Create API Key'
                )}
              </ThemedButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
