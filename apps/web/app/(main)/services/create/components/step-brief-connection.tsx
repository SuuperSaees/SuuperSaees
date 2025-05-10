'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Cross2Icon } from '@radix-ui/react-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addServiceBriefs } from 'node_modules/@kit/team-accounts/src/server/actions/briefs/create/create-briefs';
import { getPrimaryOwnerId } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { useTranslation } from 'react-i18next';
import { Service } from '~/lib/services.types';

// import { z } from 'zod';
import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem } from '@kit/ui/form';
import { useMultiStepFormContext } from '@kit/ui/multi-step-form';
import { Spinner } from '@kit/ui/spinner';

import { Option } from '~/components/ui/checkbox-combobox';
import { Brief } from '~/lib/brief.types';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';
import { createService } from '~/team-accounts/src/server/actions/services/create/create-service';
import { updateService } from '~/team-accounts/src/server/actions/services/update/update-service-server';

import { Combobox } from './combobox';
import { FormSchema } from './multiform-component';
import { handleResponse } from '~/lib/response/handle-response';

interface ServiceBrief {
  id: string;
  name: string;
  created_at: string;
  description: string;
}

interface Service {
  id: number;
  created_at: string;
  name: string;
  price: number;
  number_of_clients: number;
  status: string;
  propietary_organization_id: string;
  allowed_orders: number;
  credit_based: boolean;
  credits: number;
  hours: number;
  max_number_of_monthly_orders: number;
  max_number_of_simultaneous_orders: number;
  purchase_limit: number;
  recurrence: string | null;
  recurring_subscription: boolean;
  service_description: string;
  service_image: string | null;
  single_sale: boolean;
  standard: boolean;
  test_period: boolean;
  test_period_duration: number;
  test_period_duration_unit_of_measurement: string;
  test_period_price: number;
  time_based: boolean;
  price_id: string;
  briefs?: ServiceBrief[];
}

export default function BriefConnectionStep(
  {
  previousService,
  previousBriefs,
}: {
  previousService?: Service;
  previousBriefs?: ServiceBrief[];
}
) {
  const { prevStep, form } = useMultiStepFormContext<typeof FormSchema>();
  const { t } = useTranslation(['services', 'responses']);

  const [selectedBriefs, setSelectedBriefs] = useState<
    { id: string; name: string }[]
  >(Array.isArray(previousBriefs) ? previousBriefs : []);
  const queryClient = useQueryClient();
  const router = useRouter();
  const handleSelect = (value: Brief.Type) => {
    const prevValues = form.getValues('step_connect_briefs') ?? [];

    const newValue = { id: value.id, name: value.name };

    // prevent selecting same new value more than one time
    const isDuplicate = prevValues.some((v) => v.id === newValue.id);
    if (isDuplicate) return;
    const newValues = [...prevValues, newValue];
    form.setValue('step_connect_briefs', newValues);
    setSelectedBriefs(newValues);
    // remove the value selected from the data source
    // setBriefs((prev) => prev.filter((b) => b.id !== value.id));
  };

  const handleRemove = (id: string) => {
    const newValues = selectedBriefs.filter((brief) => brief.id !== id);
    form.setValue('step_connect_briefs', newValues);
    setSelectedBriefs(newValues);
  };

  const briefsQuery = useQuery({
    queryKey: ['briefs'],
    queryFn: async () => await getBriefs(),
  });

  const briefs = (briefsQuery.data ?? []).filter(
    (brief) => !selectedBriefs.some((selected) => selected.id === brief.id)
  );
  const briefOptions = briefs.map((brief) => ({
    value: brief.name,
    label: brief.name.charAt(0).toUpperCase() + brief.name.slice(1),
    // actionFn: () => handleSelect(brief),
  }));

  const addBriefToService = async (serviceId: number) => {
    // Insert briefs to service
    try {
      const briefsToConnect = form.getValues('step_connect_briefs');
      const formattedBriefsToConnect = briefsToConnect?.map((brief) => ({
        brief_id: brief.id,
        service_id: serviceId,
      }));
      await addServiceBriefs(formattedBriefsToConnect ?? []);
    } catch (error) {
      // reset the briefs
      setSelectedBriefs([]);
      form.setValue('step_connect_briefs', []);
      console.error(error);
      throw error;
    }
  };

  const createServiceMutation = useMutation({
    mutationFn: async () => {
      const propietary_organization_id = await getPrimaryOwnerId();
      if (!propietary_organization_id) {
        throw new Error('No propietary_organization_id provided');
      }
      const values = form.getValues() as Service.ServiceData;
      const res = await createService({
        ...values,
      });
      await handleResponse(res, 'services', t);
      const service = res.success?.data;
      

      if (!service) {
        throw new Error('Service not created');
      }

      const serviceId = service.supabase.id;

      await addBriefToService(serviceId);
      
 
    },
    onSuccess: () => {
      router.push('/services');
      void queryClient.invalidateQueries({
        queryKey: ['services'],
      });
    },
    onError: () => null,

  });

  const updateServiceMutation = useMutation({
    mutationFn: async () => {
      const values = form.getValues() as Service.ServiceData;
      values.id = previousService?.id ?? 0;
      const res = await updateService(values, previousService?.price_id ?? '');
      await handleResponse(res, 'services', t);
    },
    onSuccess: async () => {
      router.push('/services');
      await queryClient.invalidateQueries({
        queryKey: ['services'],
      });
      // invalidate the query
    },
    onError: () => {
      console.error('Error updating service');
    },
  });

  useEffect(() => {
    setSelectedBriefs(form.getValues('step_connect_briefs') ?? []);
  }, [form]);

  return (
    <section className={'full w-full'}>
      <div className="mx-auto flex h-full max-w-3xl flex-col space-y-4 text-gray-600">
        <p className="font-semibold">{t('step_connect_briefs_description')}</p>
        {briefsQuery.isLoading ? (
          <Spinner className="mx-auto w-5" />
        ) : (
          <>
            {selectedBriefs?.map((selectedBrief) => (
              <div
                key={selectedBrief.id}
                className="flex items-center justify-between rounded-md border border-gray-300 p-2"
              >
                <p>{selectedBrief.name}</p>
                <Cross2Icon
                  className="h-4 w-4 cursor-pointer text-red-500 opacity-80 hover:opacity-100"
                  onClick={() => handleRemove(selectedBrief.id)}
                />
              </div>
            ))}
            <Form {...form}>
              <FormField
                control={form.control}
                name="step_connect_briefs"
                render={() => {
                  return (
                    <FormItem>
                      <FormControl>
                        <div className="items-center flex justify-center">
                          <Combobox
                            options={briefOptions}
                            title={t('addBrief')}
                            className="justify-start gap-1 border-gray-300 shadow-none"
                            resetOnSelect
                            onSelect={(option: Option) => {
                              const selectedBrief = briefs.find(
                                (brief) => brief.name === option.value,
                              );	
                              if (selectedBrief) {
                                handleSelect(selectedBrief);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </Form>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-between space-x-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('previous')}
        </Button>

        {previousService ? (
          <Button
            type="button"
            disabled={briefsQuery.isLoading}
            onClick={async () => await updateServiceMutation.mutateAsync()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <span>{t('updateService')}</span>
            {updateServiceMutation.isPending && (
              <Spinner className="h-5 w-5 text-white" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={briefsQuery.isLoading}
            onClick={async () => await createServiceMutation.mutateAsync()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <span>{t('creation.form.submitMessage')}</span>
            {createServiceMutation.isPending && (
              <Spinner className="h-5 w-5 text-white" />
            )}
          </Button>
        )}
      </div>
    </section>
  );
}
