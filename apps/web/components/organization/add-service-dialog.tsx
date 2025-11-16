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
import { Spinner } from '@kit/ui/spinner';

import { handleResponse } from '~/lib/response/handle-response';

import SelectAction from '../ui/select';

type ServiceOption = {
  value: number;
  label: string;
  action?: () => void;
};
interface AddServiceDialogProps {
  children: React.ReactNode;
  serviceOptions?: ServiceOption[];
  clientOrganizationId: string;
  isPending: boolean;
}

export function AddServiceDialog({
  children,
  serviceOptions,
  clientOrganizationId,
  isPending,
}: AddServiceDialogProps) {
  // const [pending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('services');

  const queryClient = useQueryClient();

  const addService = useMutation({
    mutationFn: async ({ serviceSelected }: { serviceSelected: number }) => {
      const res = await addServiceToClient(
        clientOrganizationId,
        serviceSelected,
      );
      await handleResponse(res, 'services', t);
    },
    onSuccess: async () => {
      setIsOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ['services', clientOrganizationId],
      });
    },
    onError: () => null,
  });

  const addServiceSchema = z.object({
    serviceSelected: z
      .number()
      .min(1, { message: t('dialogs.add.select.error') }),
  });

  const onSubmit = async (values: z.infer<typeof addServiceSchema>) => {
    // Use transition to avoid blocking the UI thread
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

        {isPending ? (
          <Spinner className="mx-auto h-10 w-10" />
        ) : !serviceOptions?.length ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground">
              {t('dialogs.add.select.notFound')}
            </span>
          </div>
        ) : (
          <AddServiceForm
            onSubmit={onSubmit}
            serviceOptions={serviceOptions}
            addServiceSchema={addServiceSchema}
            isPending={addService.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddServiceForm({
  onSubmit,
  serviceOptions,
  addServiceSchema,
  isPending,
}: {
  onSubmit: (values: z.infer<typeof addServiceSchema>) => void;
  serviceOptions: ServiceOption[];
  addServiceSchema: z.ZodSchema;
  isPending: boolean;
}) {
  const { t } = useTranslation('services');

  const form = useForm({
    resolver: zodResolver(addServiceSchema),
    shouldUseNativeValidation: true,
    reValidateMode: 'onSubmit',
    defaultValues: {
      serviceSelected: -1,
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
                  className="w-full bg-white"
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
        <ThemedButton type="submit" className="w-full" disabled={isPending}>
          {t('dialogs.add.select.submit')}
        </ThemedButton>
      </form>
    </Form>
  );
}
