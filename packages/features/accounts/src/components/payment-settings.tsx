'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from '@kit/ui/form';
import { Separator } from '@kit/ui/separator';
import { Switch } from '@kit/ui/switch';
import { Textarea } from '@kit/ui/textarea';

import { ThemedInput } from './ui/input-themed-with-settings';
import { useOrganizationSettings } from '../context/organization-settings-context';

// Schema for payment settings
const PaymentSettingsSchema = z.object({
  enableManualPayments: z.boolean(),
  paymentMethodName: z.string().min(1, 'Payment method name is required'),
  instructions: z.string().min(1, 'Instructions are required'),
});

type PaymentSettingsType = z.infer<typeof PaymentSettingsSchema>;

// Default values for payment settings
const defaultPaymentValues: PaymentSettingsType = {
  enableManualPayments: false,
  paymentMethodName: '',
  instructions: '',
};

interface PaymentSettingsProps {
  role: string;
}

function PaymentSettings({ role: _role }: PaymentSettingsProps) {
  const { t } = useTranslation('payments');
  const { updateOrganizationSetting, payment_details } = useOrganizationSettings();
  
  // Safely parse payment_details with fallback to defaults
  const getInitialValues = (): PaymentSettingsType => {
    if (payment_details) {
      try {
        const parsed = JSON.parse(payment_details) as Partial<PaymentSettingsType>;
        return { ...defaultPaymentValues, ...parsed };
      } catch (error) {
        console.error('Error parsing payment_details:', error);
        return defaultPaymentValues;
      }
    }
    return defaultPaymentValues;
  };

  const form = useForm<PaymentSettingsType>({
    resolver: zodResolver(PaymentSettingsSchema),
    defaultValues: getInitialValues(),
  });

  const updatePaymentSetting = (updatedData: Partial<PaymentSettingsType>) => {
    const currentValues = form.getValues();
    const newValues = { ...currentValues, ...updatedData };
    
    updateOrganizationSetting.mutate({
      key: 'payment_details',
      value: JSON.stringify(newValues),
    });
  };

  const handleSwitchChange = (field: keyof PaymentSettingsType, value: boolean) => {
    form.setValue(field, value);
    updatePaymentSetting({ [field]: value });
  };

  const handleFieldChange = (field: keyof PaymentSettingsType, value: string) => {
    form.setValue(field, value);
    updatePaymentSetting({ [field]: value });
  };

  return (
    <div className="mt-4 w-full max-w-full pr-48 pb-32 space-y-8">
      <Form {...form}>
        {/* Enable Manual Payments Toggle */}
        <div className="flex justify-between items-start">
          <div className="w-[45%] pr-4">
            <label className="text-sm font-bold text-gray-900">
              {t('settings.enableManualPayments.title')}
            </label>
            <p className="text-sm text-gray-600 mt-1">
              {t('settings.enableManualPayments.description')}
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <Switch
              checked={form.getValues('enableManualPayments')}
              onCheckedChange={(checked) => handleSwitchChange('enableManualPayments', checked)}
            />
          </div>
        </div>

        {/* Conditional fields shown only when manual payments are enabled */}
        {form.getValues('enableManualPayments') && (
          <div className="p-6 space-y-6 bg-gray-50 rounded-lg">
            {/* Payment Method Name */}
            <div className="flex justify-between items-start">
              <div className="w-[45%] pr-4">
                <label className="text-sm font-medium text-gray-900">
                  {t('settings.paymentMethodName.title')}
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {t('settings.paymentMethodName.description')}
                </p>
              </div>
              <div className="flex-1">
                <FormField
                  name="paymentMethodName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThemedInput
                          {...field}
                          placeholder={t('settings.paymentMethodName.placeholder')}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldChange('paymentMethodName', e.target.value)}
                          className="text-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Instructions */}
            <div className="flex justify-between items-start">
              <div className="w-[45%] pr-4">
                <label className="text-sm font-medium text-gray-900">
                  {t('settings.instructions.title')}
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {t('settings.instructions.description')}
                </p>
              </div>
              <div className="flex-1">
                <FormField
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t('settings.instructions.placeholder')}
                          className="min-h-[120px] resize-none text-gray-700"
                          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => handleFieldChange('instructions', e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}

export default PaymentSettings; 