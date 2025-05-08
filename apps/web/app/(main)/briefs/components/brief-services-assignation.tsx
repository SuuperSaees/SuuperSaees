'use client';

import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import CheckboxCombobox from '~/components/ui/checkbox-combobox';
import ServiceTags from '~/(main)/orders/create/components/service-tags';
import { getServices } from '~/team-accounts/src/server/actions/services/get/get-services';

import { useBriefsContext } from '../contexts/briefs-context';
import { BriefCreationForm } from './brief-creation-form';
import { Button } from '@kit/ui/button';
import { Brief } from '../types/brief.types';

interface BriefServicesAssignationProps {
  form: UseFormReturn<BriefCreationForm>;
}
export default function BriefServicesAssignation({
  form,
}: BriefServicesAssignationProps) {
  const { brief, updateBrief } = useBriefsContext();
  const { t } = useTranslation('briefs');

  const [selectedServices, setSelectedService] = useState<Brief['services']>(
    brief?.services ?? [],
  );
  // Context to manage form fields
  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => await getServices(),
  });

  const serviceOptions = useMemo(() => {
    return (
      servicesQuery.data?.map((service) => ({
        value: String(service.id),
        label: service.name,
      })) ?? []
    );
  }, [servicesQuery.data]);

  const handleSelect = (value: string) => {
    const newService = servicesQuery.data?.find(
      (service) => String(service.id) === value,
    );
    if (!newService) return;

    setSelectedService((prevServices) => {
      const isAlreadySelected = prevServices.some(
        (service) => service.id == newService.id,
      );
      if (!isAlreadySelected) {
        const newServices = [...prevServices, newService];
        form.setValue(
          'connected_services',
          newServices.map((service) => service.id),
        );
        updateBrief({ ...brief, services: newServices });
        return newServices;
      } else {
        const newServices = prevServices.filter(
          (service) => service.id !== newService.id,
        );
        form.setValue(
          'connected_services',
          newServices.map((service) => service.id),
        );
        updateBrief({ ...brief, services: newServices });
        return newServices;
      }
    });
  };

  function handleFormSubmit() {
    form.setValue(
      'connected_services',
      selectedServices.map((service) => service.id),
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 border-t border-gray-200 py-4">
      <h4 className="text-sm font-semibold">
        {t('creation.panel.settings.services.title')}
      </h4>
      <div className="no-scrollbar flex max-h-52 items-center gap-2 overflow-y-auto">
        <div className="inline-flex flex-wrap gap-2 items-center">
          <ServiceTags services={selectedServices} className="inline-flex" />
          <CheckboxCombobox
            customItemTrigger={
              <Button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 p-0 text-black hover:bg-gray-200 text-gray-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
            options={serviceOptions}
            defaultValues={{
              serviceIds: brief.services.map((service) => String(service.id)) ?? [],
            }}
            values={selectedServices.map((service) => String(service.id))}
            onSubmit={handleFormSubmit}
            schema={z.object({
              serviceIds: z.array(z.string()),
            })}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
