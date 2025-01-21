'use client';

import { useState } from 'react';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  CustomFormLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Switch } from '@kit/ui/switch';

import { FormData } from '../types/billing-form-types';

interface UserDataFieldsProps {
  form: UseFormReturn<FormData>;
}

export const UserInfo: React.FC<UserDataFieldsProps> = ({ form }) => {
  const [isBuyingForOrganization, setIsBuyingForOrganization] = useState(false);
  const { t } = useTranslation('services');

  const fields: { name: keyof FormData; label: string; placeholder: string }[] =
    [
      {
        name: 'fullName',
        label: t('checkout.full_name'),
        placeholder: t('checkout.enter_full_name'),
      },
      {
        name: 'email',
        label: t('checkout.email'),
        placeholder: t('checkout.enter_email'),
      },
      {
        name: 'address',
        label: t('checkout.address'),
        placeholder: t('checkout.enter_address'),
      },
      {
        name: 'country',
        label: t('checkout.country'),
        placeholder: t('checkout.choose_country'),
      },
      {
        name: 'city',
        label: t('checkout.city'),
        placeholder: t('checkout.enter_city'),
      },
      {
        name: 'state_province_region',
        label: t('checkout.state_province'),
        placeholder: t('checkout.enter_state'),
      },
      {
        name: 'postal_code',
        label: t('checkout.postal_code'),
        placeholder: t('checkout.enter_postal_code'),
      },
    ];

  const organizationFields: {
    name: keyof FormData;
    label: string;
    placeholder: string;
  }[] = [
    {
      name: 'enterprise_name',
      label: t('checkout.enterprise_name'),
      placeholder: t('checkout.enter_organization_name'),
    },
    {
      name: 'tax_code',
      label: t('checkout.tax_code'),
      placeholder: t('checkout.enter_fiscal_code'),
    },
  ];

  const renderField = ({
    name,
    label,
    placeholder,
  }: {
    name: keyof FormData;
    label: string;
    placeholder?: string;
  }) => {
    const requiredFields = [
      'fullName',
      'email',
      'address',
      'country',
      'city',
      'state_province_region',
      'postal_code',
    ];
    const isRequired = requiredFields.includes(name);

    return (
      <FormField
        key={name}
        name={name}
        control={form.control}
        render={({ field }) => (
          <FormItem className="w-full">
            <CustomFormLabel
              label={label}
              required={isRequired}
              textSize="text-[14px]"
            />
            <FormControl>
              <Input {...field} placeholder={placeholder} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div>
      <div className="font-inter mb-6 text-[18px] font-semibold text-gray-900 dark:text-gray-100">
        {t('checkout.billing_details_title')}
      </div>

      <div className="space-y-6">
        {fields.slice(0, 1).map((field) =>
          renderField({
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
          }),
        )}
      </div>

      <div className="mt-6 space-y-6">
        {fields.slice(1, 2).map((field) =>
          renderField({
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
          }),
        )}
      </div>

      <div className="mt-6 space-y-6">
        {fields.slice(2, 3).map((field) =>
          renderField({
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
          }),
        )}
      </div>

      <div className="mt-6 space-y-6">
        {fields.slice(3, 4).map((field) =>
          renderField({
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
          }),
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {fields.slice(4).map((field) =>
          renderField({
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
          }),
        )}
      </div>

      <div className="mt-8">
        <FormField
          name="buying_for_organization"
          render={({ field }) => (
            <div className="flex items-center space-x-3">
              <FormControl>
                <Switch
                  id="buying_for_organization"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsBuyingForOrganization(checked);
                  }}
                />
              </FormControl>
              <Label htmlFor="buying_for_organization">
                {t('checkout.buying_for_organization')}
              </Label>
            </div>
          )}
        />
      </div>

      {isBuyingForOrganization && (
        <div className="mt-6 grid grid-cols-1 gap-6">
          {organizationFields.map((field) =>
            renderField({
              name: field.name,
              label: field.label,
              placeholder: field.placeholder,
            }),
          )}
        </div>
      )}
    </div>
  );
};
