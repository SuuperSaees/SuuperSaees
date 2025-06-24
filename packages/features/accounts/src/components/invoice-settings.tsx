'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Alert } from '../../../../../apps/web/app/components/shared/export-csv-button/alert';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from '@kit/ui/form';
import { Separator } from '@kit/ui/separator';
import { Switch } from '@kit/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import { ThemedInput } from './ui/input-themed-with-settings';

// Schema for invoice settings - ready for server integration
const InvoiceSettingsSchema = z.object({
  invoiceManagementEnabled: z.boolean(),
  requireCompleteAddress: z.boolean(),
  automaticInvoiceNote: z.boolean(),
  invoiceFrom: z.string(),
  taxCode: z.string(),
  country: z.string(),
  streetAddress: z.string(),
  city: z.string(),
  stateProvince: z.string().optional(),
  zipPostalCode: z.string(),
});

type InvoiceSettingsType = z.infer<typeof InvoiceSettingsSchema>;

// TODO: Replace with proper country library like 'react-select-country-list' or 'react-country-state-city'
// Recommended: npm install react-select-country-list
// import countryList from 'react-select-country-list';
// const countries = countryList().getData();

// Dummy countries data - ready to be replaced with actual country list
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'mx', label: 'Mexico' },
  { value: 'br', label: 'Brazil' },
  { value: 'au', label: 'Australia' },
];

// Dummy initial data - ready for server integration
const initialInvoiceData: InvoiceSettingsType = {
  invoiceManagementEnabled: true,
  requireCompleteAddress: false,
  automaticInvoiceNote: false,
  invoiceFrom: '',
  taxCode: '',
  country: '',
  streetAddress: '',
  city: '',
  stateProvince: '',
  zipPostalCode: '',
};

interface InvoiceSettingsProps {
  role: string;
}

function InvoiceSettings({ role: _role }: InvoiceSettingsProps) {
  const { t } = useTranslation('invoices');
  const [invoiceSettings, setInvoiceSettings] = useState(initialInvoiceData);

  const form = useForm<InvoiceSettingsType>({
    resolver: zodResolver(InvoiceSettingsSchema),
    defaultValues: invoiceSettings,
  });

  // Dummy update function - ready for server integration
  const updateInvoiceSetting = (key: string, value: string | boolean) => {
    setInvoiceSettings(prev => ({ ...prev, [key]: value }));
    console.log('Updating invoice setting:', key, value);
    // TODO: Replace with actual API call
  };

  const handleSwitchChange = (field: keyof InvoiceSettingsType, value: boolean) => {
    form.setValue(field, value);
    updateInvoiceSetting(field, value);
  };

  const handleFieldChange = (field: keyof InvoiceSettingsType, value: string) => {
    form.setValue(field, value);
    updateInvoiceSetting(field, value);
  };

  return (
    <div className="mt-4 w-full max-w-full pr-48 pb-32 space-y-8">
      <Form {...form}>
        {/* Invoice Management Toggle */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.invoiceManagement.title')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t('settings.invoiceManagement.description')}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Switch
                checked={invoiceSettings.invoiceManagementEnabled}
                onCheckedChange={(checked) => handleSwitchChange('invoiceManagementEnabled', checked)}
              />
            </div>
          </div>
        </div>
        
        <Separator />

        {/* Require Complete Address Toggle */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.requireCompleteAddress.title')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t('settings.requireCompleteAddress.description')}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Switch
                checked={invoiceSettings.requireCompleteAddress}
                onCheckedChange={(checked) => handleSwitchChange('requireCompleteAddress', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Automatic Invoice Note Toggle */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.automaticInvoiceNote.title')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t('settings.automaticInvoiceNote.description')}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Switch
                checked={invoiceSettings.automaticInvoiceNote}
                onCheckedChange={(checked) => handleSwitchChange('automaticInvoiceNote', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Billing Information Section Header */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">{t('settings.billingInformation.title')}</label>
          <p className="text-sm text-gray-600">{t('settings.billingInformation.description')}</p>
        </div>

        {/* Company Information Group */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h4 className="text-sm font-semibold text-gray-900">{t('settings.billingInformation.companyInformation.title')}</h4>
            <p className="text-xs text-gray-500 mt-1">{t('settings.billingInformation.companyInformation.subtitle')}</p>
          </div>

          {/* Company Name */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.billingInformation.companyInformation.companyName.label')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                This will be shown in your invoices
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="invoiceFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t('settings.billingInformation.companyInformation.companyName.placeholder')}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldChange('invoiceFrom', e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tax ID */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.billingInformation.companyInformation.taxId.label')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Your business tax identification number
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t('settings.billingInformation.companyInformation.taxId.placeholder')}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldChange('taxCode', e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Country */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.billingInformation.companyInformation.country.label')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Choose your business location
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleFieldChange('country', value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('settings.billingInformation.companyInformation.country.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Business Address Group */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h4 className="text-sm font-semibold text-gray-900">{t('settings.billingInformation.businessAddress.title')}</h4>
            <p className="text-xs text-gray-500 mt-1">{t('settings.billingInformation.businessAddress.subtitle')}</p>
          </div>

          {/* Street Address */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.billingInformation.businessAddress.streetAddress.label')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Your business street address
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t('settings.billingInformation.businessAddress.streetAddress.placeholder')}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldChange('streetAddress', e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* City */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.billingInformation.businessAddress.city.label')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                City where your business is located
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t('settings.billingInformation.businessAddress.city.placeholder')}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldChange('city', e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* State/Province */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.billingInformation.businessAddress.stateProvince.label')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                State or province (if applicable)
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="stateProvince"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t('settings.billingInformation.businessAddress.stateProvince.placeholder')}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldChange('stateProvince', e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* ZIP Code */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t('settings.billingInformation.businessAddress.zipCode.label')}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Your postal or ZIP code
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="zipPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t('settings.billingInformation.businessAddress.zipCode.placeholder')}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldChange('zipPostalCode', e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Info Alert */}
        <Alert 
          title={t('settings.billingInformation.infoNote.title')}
          description={t('settings.billingInformation.infoNote.description')}
          type="info"
          visible={true}
          className='bg-blue-50 border-none'
        />
      </Form>
    </div>
  );
}

export default InvoiceSettings; 