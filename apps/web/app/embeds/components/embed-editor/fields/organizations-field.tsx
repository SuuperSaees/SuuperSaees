'use client';

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { FormControl, FormField, FormItem, FormLabel } from '@kit/ui/form';

import CheckboxCombobox, {
  type CustomItemProps,
} from '~/components/ui/checkbox-combobox';
import { getClientsOrganizations } from '~/team-accounts/src/server/actions/clients/get/get-clients';

import type { FormValues, Organization, SelectOption } from '../../../schema';

interface OrganizationsFieldProps {
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  defaultValues?: FormValues['embed_accounts'] | undefined;
}

const organizationsSchema = z.object({
  organizations: z.array(z.string()),
});

export function OrganizationsField({
  control,
  setValue,
  defaultValues,
}: OrganizationsFieldProps) {
  const { t } = useTranslation('embeds');
  const [selectedOrganizations, setSelectedOrganizations] = useState<
    Organization[]
  >([]);

  const clientsOrganizationsQuery = useQuery({
    queryKey: ['clientsOrganizations'],
    queryFn: async () => await getClientsOrganizations(),
  });

  const filteredOrganizations = useMemo(
    () =>
      clientsOrganizationsQuery.data?.filter(
        (org) => !org.name.startsWith('guest'),
      ),
    [clientsOrganizationsQuery.data],
  );
  const organizationOptions = useMemo(() => {
    return (
      filteredOrganizations?.map((org) => ({
        value: org.id,
        label: org.name,
        picture_url: org.picture_url,
      })) ?? []
    );
  }, [filteredOrganizations]);

  const handleOrganizationSelect = (value: string) => {
    const newOrg = clientsOrganizationsQuery.data?.find(
      (org) => org.id === value,
    );
    if (!newOrg) return;

    const orgData: Organization = {
      id: newOrg.id,
      name: newOrg.name,
      picture_url: newOrg.picture_url,
    };

    setSelectedOrganizations((prev) => {
      const isSelected = prev.some((org) => org.id === value);
      const newOrgs = isSelected
        ? prev.filter((org) => org.id !== value)
        : [...prev, orgData];

      setValue(
        'embed_accounts',
        newOrgs.map((org) => org.id),
      );
      return newOrgs;
    });
  };

  const handleOrganizationRemove = (value: string) => {
    setSelectedOrganizations((prev) => {
      const newOrgs = prev.filter((org) => org.id !== value);
      setValue(
        'embed_accounts',
        newOrgs.map((org) => org.id),
      );
      return newOrgs;
    });
  };

  const handleComboboxSubmit = (values: { organizations: string[] }) => {
    console.log('Selected organizations:', values.organizations);
  };

  // If default values are provided, set the selected organizations based on the organization loaded in the query
  useEffect(() => {
    if (organizationOptions?.length && defaultValues?.length) {
      const newSelectedOrganizations = organizationOptions
        .filter((org) => defaultValues.includes(org.value))
        .map((org) => ({
          id: org.value,
          name: org.label,
          picture_url: org.picture_url,
        }));
      setSelectedOrganizations(newSelectedOrganizations);
    }
  }, [defaultValues, organizationOptions]);

  const CustomItem = ({
    option,
  }: CustomItemProps<SelectOption & { picture_url?: string }>) => (
    <div className="flex items-center gap-2 py-0.5">
      <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-100">
        <span className="text-[10px] font-medium uppercase">
          {option.label.charAt(0)}
        </span>
      </div>
      <span className="text-sm text-gray-700">{option.label}</span>
    </div>
  );

  const CustomTrigger = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      if (scrollContainerRef.current) {
        event.preventDefault();
        scrollContainerRef.current.scrollLeft += event.deltaY;
      }
    };

    return (
      <div className="flex h-fit min-h-9 w-full items-center gap-2 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-1.5">
        <Search className="h-4 w-4 text-gray-400" />
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex w-full max-w-full gap-1.5 overflow-x-auto whitespace-nowrap"
          onWheel={handleWheel}
        >
          {selectedOrganizations?.map((org, index) => (
            <div
              className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
              key={index}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-100">
                <span className="text-[10px] font-medium uppercase">
                  {org.name.charAt(0)}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-700">
                {org.name}
              </span>
              <button
                type="button"
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-sm text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => handleOrganizationRemove(org.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <FormField
      control={control}
      name="embed_accounts"
      render={() => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {t('form.inputs.organizations.label')}
            <span className="ml-0.5 text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <CheckboxCombobox
              className="w-full"
              options={organizationOptions}
              values={selectedOrganizations.map((org) => org.id)}
              onSelect={handleOrganizationSelect}
              customItemTrigger={<CustomTrigger />}
              classNameTrigger="w-full h-fit"
              isLoading={clientsOrganizationsQuery.isLoading}
              customItem={CustomItem}
              schema={organizationsSchema}
              defaultValues={{
                organizations: selectedOrganizations.map((org) => org.id),
              }}
              onSubmit={handleComboboxSubmit}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
