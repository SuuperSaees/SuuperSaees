'use client';

import {
  useState, // useTransition
} from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { addServiceToClient } from 'node_modules/@kit/team-accounts/src/server/actions/services/create/create-service';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

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

import SelectAction from '../ui/select';

type ServiceOption = {
  value: string;
  label: string;
  action?: () => void;
};
interface AddServiceDialogProps {
  children: React.ReactNode;
  serviceOptions: ServiceOption[];
  clientOrganizationId: string;
}

export function AddServiceDialog({
  children,
  serviceOptions,
  clientOrganizationId,
}: AddServiceDialogProps) {
  // const [pending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('services');
  const queryClient = useQueryClient();
  const addService = useMutation({
    mutationFn: async ({ serviceSelected }: { serviceSelected: number }) =>
      await addServiceToClient(clientOrganizationId, serviceSelected),
    onSuccess: async () => {
      toast.success('Success', {
        description: 'Service added successfully!',
      });
      setIsOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ['services', clientOrganizationId],
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'Service could not be added!',
      });
    },
  });

  // Dynamically create schema with the translated error message
  const addServiceSchema = z.object({
    serviceSelected: z
      .number()
      .min(1, { message: t('dialogs.add.select.error') }),
  });

  const onSubmit = async (values: z.infer<typeof addServiceSchema>) => {
    // Use transition to avoid blocking the UI thread
    console.log('values', values);
    await addService.mutateAsync({ serviceSelected: values.serviceSelected });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('dialogs.add.title')}</DialogTitle>

          <DialogDescription>
            {t('services:dialogs.add.description')}
          </DialogDescription>
        </DialogHeader>

        <AddServiceForm
          onSubmit={onSubmit}
          serviceOptions={serviceOptions}
          addServiceSchema={addServiceSchema}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddServiceForm({
  onSubmit,
  serviceOptions,
  addServiceSchema,
}: {
  onSubmit: (values: z.infer<typeof addServiceSchema>) => void;
  serviceOptions: ServiceOption[];
  addServiceSchema: z.ZodSchema;
}) {
  const { t } = useTranslation('services');

  const form = useForm({
    resolver: zodResolver(addServiceSchema),
    shouldUseNativeValidation: true,
    reValidateMode: 'onSubmit',
    defaultValues: {
      serviceSelected: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="serviceSelected"
          render={() => (
            <FormItem>
              <FormControl>
                <SelectAction
                  options={serviceOptions}
                  className="bg-white"
                  groupName={t('dialogs.add.select.label')}
                  onSelectHandler={(value: string) => {
                    form.setValue('serviceSelected', Number(value));
                  }}
                >
                  <FormLabel>{t('dialogs.add.select.label')}</FormLabel>
                </SelectAction>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <ThemedButton type="submit" className="w-full">
          {t('dialogs.add.select.submit')}
        </ThemedButton>
      </form>
    </Form>
  );
}
