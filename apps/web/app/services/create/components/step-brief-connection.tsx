'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { addServiceBriefs } from 'node_modules/@kit/team-accounts/src/server/actions/briefs/create/create-briefs';
import { getPrimaryOwnerId } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { createService } from 'node_modules/@kit/team-accounts/src/server/actions/services/create/create-service-server';
import { useTranslation } from 'react-i18next';

// import { z } from 'zod';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';
import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem } from '@kit/ui/form';
import {
  useMultiStepFormContext,
} from '@kit/ui/multi-step-form';

import { Brief } from '~/lib/brief.types';
import { Database } from '~/lib/database.types';

import { Combobox } from './combobox';
import { FormSchema } from './multiform-component';


export default function BriefConnectionStep() {
  const { prevStep, form } = useMultiStepFormContext<typeof FormSchema>();
  const { t } = useTranslation('services');
  const [loading, setLoading] = useState(false);

  const client = getSupabaseBrowserClient<Database>();
  const [briefs, setBriefs] = useState<Brief.Type[]>([]);
  const [selectedBriefs, setSelectedBriefs] = useState<
    { id: string; name: string }[]
  >([]);

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

  const briefOptions = briefs.map((brief) => ({
    value: brief.name,
    label: brief.name.charAt(0).toUpperCase() + brief.name.slice(1),
    actionFn: () => handleSelect(brief),
  }));

  const addBriefToService = async (serviceId: number) => {
    // Insert briefs to service
    try {
      const briefsToConnect = form.getValues('step_connect_briefs');
      const formattedBriefsToConnect = briefsToConnect.map((brief) => ({
        brief_id: brief.id,
        service_id: serviceId,
      }));
      await addServiceBriefs(formattedBriefsToConnect);
      console.log('briefs added to service');
    } catch (error) {
      // reset the briefs
      setSelectedBriefs([]);
      form.setValue('step_connect_briefs', []);
      console.error(error);
      throw error;
    }
  };

  const createNewService = async () => {
    // Create the service
    // "services" needs to be modified when all the model is well defined and handled via prev steps
    try {
      // const { service_name } = form.getValues('step_service_details');
      const propietary_organization_id = await getPrimaryOwnerId();
      if (!propietary_organization_id) {
        throw new Error('No propietary_organization_id provided');
      }
      const values = form.getValues();
      const service = await createService({
        ...values,
      });

      console.log('values', values);

      if (!service) {
        throw new Error('Service not created');
      }

      const serviceId = service.id;

      await addBriefToService(serviceId);
      //window.location.reload();
      // onSubmit()
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const getBriefs = async () => {
      setLoading(true);

      const firstAccountId = await getPrimaryOwnerId();

      if (firstAccountId) {
        const { data } = await client.from('briefs').select(`
              id,
              created_at,
              name,
              propietary_organization_id,
              services ( name )
              `);

        return data;
      }
    };

    getBriefs()
      .then((data) => {
        setBriefs(data as Brief.Type[]);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => {
    setSelectedBriefs(form.getValues('step_connect_briefs') ?? []);
  }, [form]);

  return (
    <section
      className={
        'mx-auto flex h-full max-w-3xl flex-col space-y-4 text-gray-600'
      }
    >
      <p>{t('step_connect_briefs_description')}</p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        selectedBriefs?.map((selectedBrief) => (
          <div
            key={selectedBrief.id}
            className="rounded-md border border-gray-300 p-2"
          >
            <p>{selectedBrief.name}</p>
          </div>
        ))
      )}

      <Form {...form}>
        <FormField
          control={form.control}
          name="step_connect_briefs"
          render={() => {
            return (
              <FormItem>
                <FormControl>
                  <Combobox
                    options={briefOptions}
                    title={t('addBrief')}
                    className="justify-start gap-1 border-none pl-0 shadow-none"
                    resetOnSelect
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
      </Form>

      <div className="mt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Previous
        </Button>

        <Link
          type="button"
          onClick={createNewService}
          href={'/services'}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
          px-4"
        >
          {t('createService')}
        </Link>
      </div>
    </section>
  );
}
