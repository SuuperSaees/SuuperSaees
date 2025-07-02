import { useState } from 'react';

import { CheckCircle, Minus, Plus } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { FormField } from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { DiscountIcon, SecurityIcon } from '~/components/icons/icons';

import { FormData } from '../types/billing-form-types';
import { ServiceTypeSection } from './service-type-section';
import { Invoice } from '~/lib/invoice.types';

type ServiceForCheckout = {
  name?: string | null;
  price?: number | null;
  currency?: string | null;
  recurrence?: string | null;
  service_image?: string | null;
  test_period?: boolean | null;
  test_period_price?: number | null;
  test_period_duration?: number | null;
  test_period_duration_unit_of_measurement?: string | null;
  recurring_subscription?: boolean | null;
};

const isColorDark = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness < 128;
};

interface SideDataFieldsProps {
  form: UseFormReturn<FormData>;
  service?: ServiceForCheckout;
  invoice?: Invoice.Response;
  loading: boolean;
  errorMessage: string;
  accountId: string;
  validSuccess: boolean;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  selectedPaymentMethod: string;
  onSubmit: () => void;
  sidebarBackgroundColor: string;
}

export const SideInfo: React.FC<SideDataFieldsProps> = ({
  form,
  service,
  invoice,
  loading,
  accountId,
  validSuccess,
  quantity,
  setQuantity,
  selectedPaymentMethod,
  sidebarBackgroundColor,
  onSubmit,
}) => {
  const { t } = useTranslation('services');
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const isDarkBackground = isColorDark(sidebarBackgroundColor);

  const handleApplyDiscount = async () => {
    if (selectedPaymentMethod !== 'stripe' || invoice) return; // Don't apply discount for invoices
    const discountCode = form.getValues('discount_coupon');
    setIsApplyingDiscount(true);

    try {
      const response = await fetch('/api/stripe/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountCode,
          accountId,
          servicePrice: service?.price,
        }),
      });
      const data = await response.clone().json();

      if (response.ok && data.discountAmount) {
        setDiscountAmount(data.discountAmount);
      } else {
        setDiscountAmount(null);
        form.setError('discount_coupon', {
          message: t('checkout.invalid_coupon'),
        });
      }
    } catch (error) {
      console.error('Failed to apply discount:', error);
      setDiscountAmount(null);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const discountedTotal = invoice
    ? invoice.total_amount ?? 0
    : (discountAmount
      ? (service?.price ?? 0) - discountAmount
      : (service?.price ?? 0)) * quantity;

      const secondaryTextColor = isDarkBackground
      ? 'text-gray-300'
      : 'text-gray-500';

      const getTextPeriodForBilling = () => {
        if (service?.recurrence?.includes('day')) {
          return t('checkout.trial.dayBilling');
        }
        if (service?.recurrence?.includes('week')) {
          return t('checkout.trial.weekBilling');
        }
        if (service?.recurrence?.includes('month')) {
          return t('checkout.trial.monthBilling');
        }
        if (service?.recurrence?.includes('year')) {
          return t('checkout.trial.yearBilling');
        }
      };

      const getStartPeriod = () => {
        const testPeriodDuration = service?.test_period_duration ?? 0;
        const testPeriodUnit = service?.test_period_duration_unit_of_measurement ?? '';
        const currentDate = new Date();

        if(testPeriodUnit.includes('day')) {
          currentDate.setDate(currentDate.getDate() + testPeriodDuration);
        }
        if(testPeriodUnit.includes('week')) {
          currentDate.setDate(currentDate.getDate() + testPeriodDuration * 7);
        }
        if(testPeriodUnit.includes('month')) {
          currentDate.setMonth(currentDate.getMonth() + testPeriodDuration);
        }
        if(testPeriodUnit.includes('year')) {
          currentDate.setFullYear(currentDate.getFullYear() + testPeriodDuration);
        }

        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

        const monthName = monthNames[currentDate.getMonth()];
        const day = currentDate.getDate();
        const year = currentDate.getFullYear();

        const monthNameFormatted = t(`checkout.trial.${monthName}`);

        const dateFormatted = t('language') === 'es' ? day + ' ' + monthNameFormatted + ', ' + year : monthNameFormatted + ' ' + day + ', ' + year;

        return t('checkout.trial.startingAt') + ' ' + dateFormatted;
      };
      

  return (
    <div className="space-y-4">
      <div
        className={`font-inter text-[18px] font-semibold leading-[1.27] ${
          isDarkBackground ? 'text-white' : 'text-gray-900'
        }`}
      >
        {t('checkout.resume')}
      </div>

      {/* Componente de servicio o invoice */}
      <div className="space-y-4">
        <ServiceTypeSection
          service={service}
          invoice={invoice}
          isDarkBackground={isDarkBackground}
        />
      </div>

      {/* Manejo de cantidades - solo para servicios sin recurrencia */}
      {!service?.recurrence && !invoice && (
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`text-sm font-medium leading-5 ${
              isDarkBackground ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {t('checkout.quantity')}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleIncreaseQuantity}
              className={`flex h-6 w-6 items-center justify-center rounded border ${
                isDarkBackground ? 'border-gray-500' : 'border-gray-300'
              }`}
              style={{ width: '24px', height: '24px' }}
            >
              <Plus
                className={`h-4 w-4 ${
                  isDarkBackground ? 'text-gray-300' : 'text-gray-700'
                }`}
              />
            </button>

            <span
              className={`px-2 text-sm font-medium ${
                isDarkBackground ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {quantity}
            </span>

            <button
              type="button"
              onClick={handleDecreaseQuantity}
              className={`flex h-6 w-6 items-center justify-center rounded border ${
                isDarkBackground ? 'border-gray-500' : 'border-gray-300'
              }`}
              style={{ width: '24px', height: '24px' }}
            >
              <Minus
                className={`h-4 w-4 ${
                  isDarkBackground ? 'text-gray-300' : 'text-gray-700'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Campo de cupón de descuento - solo para servicios con Stripe */}
      {selectedPaymentMethod === 'stripe' && !invoice && (
        <FormField
        name="discount_coupon"
        control={form.control}
        render={({ field }) => (
          <div className="relative flex items-center">
            <DiscountIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-500" />
            <input
              {...field}
              placeholder={t('checkout.discount_coupon')}
              className="h-12 w-full rounded-lg border border-gray-300 pl-12 pr-24"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 h-7 -translate-y-1/2 transform bg-transparent px-4 font-medium text-black"
              onClick={handleApplyDiscount}
              disabled={isApplyingDiscount}
            >
              {isApplyingDiscount ? (
                <Spinner className="h-4 w-4" />
              ) : (
                t('checkout.apply')
              )}
            </button>
          </div>
        )}
      />
      )}

      {/* Subtotal - solo para servicios sin período de prueba */}
      {!service?.test_period && !invoice && (
        <div className="flex justify-between">
          <div
            className={`text-sm font-medium leading-5 ${
              isDarkBackground ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {t('checkout.subtotal')}
          </div>        <div
          className={`text-sm font-medium leading-5 ${
            isDarkBackground ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          ${(service?.price ?? 0 * quantity)?.toFixed(2)} {service?.currency?.toUpperCase() ?? 'USD'}
        </div>
        </div>
      )}

      

      {/* Período de prueba - solo para servicios */}
      {service?.test_period && !invoice && (
          <div className="flex justify-between">
            <div className={`text-sm font-normal leading-5 ${secondaryTextColor}`}>
              <p>{getTextPeriodForBilling()}</p>
              <p>{getStartPeriod()}</p>
            </div>
            <span className={`text-sm ${secondaryTextColor}`}>
              ${(service?.price ?? 0 * quantity)?.toFixed(2)} {service?.currency?.toUpperCase() ?? 'USD'}
            </span>
          </div>
        )
      }

      {/* Descuento - solo para servicios */}
      {discountAmount !== null && !invoice && (
        <div className={`flex justify-between ${secondaryTextColor}`}>
          <div className="text-sm font-medium leading-5">
            {t('checkout.discount')}
          </div>
          <div className="text-sm font-medium leading-5">
            -${(discountAmount * quantity).toFixed(2)} {service?.currency?.toUpperCase() ?? 'USD'}
          </div>
        </div>
      )}

      {/* Total */}
      {invoice ? (
        // Total para invoices
        <div className="flex justify-between">
          <div
            className={`text-sm font-bold leading-5 ${
              isDarkBackground ? 'text-white' : 'text-gray-950'
            }`}
          >
            {t('checkout.total')}
          </div>
          <div
            className={`text-sm font-bold leading-5 ${
              isDarkBackground ? 'text-white' : 'text-gray-950'
            }`}
          >
            ${(invoice.total_amount ?? 0).toFixed(2)} {invoice.currency?.toUpperCase() ?? 'USD'}
          </div>
        </div>
      ) : !service?.test_period ? (
        // Total para servicios sin período de prueba
        <div className="flex justify-between">
          <div
            className={`text-sm font-bold leading-5 ${
              isDarkBackground ? 'text-white' : 'text-gray-950'
            }`}
          >
            {service?.recurring_subscription ? t('checkout.trial.totalDueToday') : t('checkout.total')}
          </div>
          <div
            className={`text-sm font-bold leading-5 ${
              isDarkBackground ? 'text-white' : 'text-gray-950'
            }`}
          >
            ${(discountedTotal)?.toFixed(2)} {service?.currency?.toUpperCase() ?? 'USD'}
          </div>
        </div>
      ) : (
        // Total para servicios con período de prueba
        <div>
          <div className="flex justify-between">
            <div
              className={`text-sm font-bold leading-5 ${
                isDarkBackground ? 'text-white' : 'text-gray-950'
              }`}
            >
              {t('checkout.trial.totalAfterTrial')}
            </div>
            <div
              className={`text-sm font-bold leading-5 ${
                isDarkBackground ? 'text-white' : 'text-gray-950'
              }`}
            >
              ${(discountedTotal)?.toFixed(2)} {service?.currency?.toUpperCase() ?? 'USD'}
            </div>
          </div>
          <div className="flex justify-between">
            <div
              className={`text-sm font-bold leading-5 ${
                isDarkBackground ? 'text-white' : 'text-gray-950'
              }`}
            >
              {t('checkout.trial.totalDueToday')}
            </div>
            <div
              className={`text-sm font-bold leading-5 ${
                isDarkBackground ? 'text-white' : 'text-gray-950'
              }`}
            >
              ${service?.test_period_price?.toFixed(2)} {service?.currency?.toUpperCase() ?? 'USD'}
            </div>
          </div>
        </div>
      )}

      {/* Botón de pago */}
      <div>
        {validSuccess ? (
          <Button
            type="button"
            className="w-full transform bg-green-600 text-white transition duration-300 ease-in-out hover:scale-105"
          >
            <CheckCircle className="mr-2 h-4 w-4 text-white transition-opacity duration-300" />
          </Button>
        ) : (
          <ThemedButton
            type="submit"
            disabled={loading}
            className="w-full transform transition duration-300 ease-in-out hover:scale-105"
            onClick={onSubmit}
          >
            {invoice 
              ? t('checkout.pay') 
              : service?.test_period 
                ? t('checkout.trial.subscribe') 
                : service?.recurring_subscription 
                  ? t('checkout.subscribe') 
                  : t('checkout.pay')
            }
            {loading && <Spinner className="ml-2 h-4 w-4" />}
          </ThemedButton>
        )}
      </div>

      {/* Mensaje de seguridad */}
      <div className="flex items-start gap-3">
        <SecurityIcon
          className={`h-5 w-5 ${isDarkBackground ? 'invert filter' : 'text-black'}`}
        />
        <div>
          <div
            className={`text-sm font-medium ${
              isDarkBackground ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('checkout.secure_checkout')}
          </div>
        </div>
      </div>
      <div
        className={`mt-3 items-start text-sm ${
          isDarkBackground ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {t('checkout.secure_description')}
      </div>
    </div>
  );
};
