import { useState } from 'react';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

  const fields: { name: keyof FormData; label: string }[] = [
    { name: 'fullName', label: t('checkout.full_name') },
    { name: 'email', label: t('checkout.email') },
    { name: 'address', label: t('checkout.address') },
    { name: 'city', label: t('checkout.city') },
    { name: 'country', label: t('checkout.country') },
    { name: 'state_province_region', label: t('checkout.state_province') },
    { name: 'postal_code', label: t('checkout.postal_code') },
  ];

  const organizationFields: { name: keyof FormData; label: string }[] = [
    { name: 'enterprise_name', label: t('checkout.enterprise_name') },
    { name: 'tax_code', label: t('checkout.tax_code') },
  ];

  const renderField = ({
    name,
    label,
  }: {
    name: keyof FormData;
    label: string;
  }) => (
    <FormField
      key={name}
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
            {label}
          </FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div>
      <div className="font-inter text-base font-semibold leading-[2.375] text-gray-900">
        {t('checkout.personalDetails')}
      </div>
      <div className="mb-10 mt-1 flex items-center gap-4">
        {fields.slice(0, 2).map(renderField)}
      </div>
      <div className="font-inter text-base font-semibold leading-[2.375] text-gray-900">
        {t('checkout.billingAddress')}
      </div>
      <div className="mt-1 flex items-center gap-4">
        {fields.slice(2, 4).map(renderField)}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {fields.slice(4).map(renderField)}
      </div>
      <div className="mb-4">
        <FormField
          name="buying_for_organization"
          render={({ field }) => (
            <div className="mb-4 mt-4 flex items-center space-x-2">
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
        <div className="mt-4 flex items-center gap-4">
          {organizationFields.map(renderField)}
        </div>
      )}
    </div>
  );
};
