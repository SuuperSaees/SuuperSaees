import { useState } from 'react';

import { CheckCircle } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { FormField } from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { FormData, ServiceType } from '../types/billing-form-types';
import { ServiceTypeSection } from './service-type-section';

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
  service: ServiceType;
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
  loading,
  accountId,
  validSuccess,
  quantity,
  selectedPaymentMethod,
  sidebarBackgroundColor,
  onSubmit,
}) => {
  const { t } = useTranslation('services');
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const isDarkBackground = isColorDark(sidebarBackgroundColor);

  const handleApplyDiscount = async () => {
    if (selectedPaymentMethod !== 'stripe') return;
    const discountCode = form.getValues('discount_coupon');
    setIsApplyingDiscount(true);

    try {
      const response = await fetch('/api/stripe/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountCode,
          accountId,
          servicePrice: service.price,
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

  const discountedTotal =
    (discountAmount
      ? (service.price ?? 0) - discountAmount
      : (service.price ?? 0)) * quantity;

  return (
    <div className="space-y-4">
      <div
        className={`font-inter text-xl font-semibold leading-[1.27] ${
          isDarkBackground ? 'text-white' : 'text-gray-900'
        }`}
      >
        {t('checkout.resume')}
      </div>

      {/* Componente de servicio */}
      <div className="space-y-4">
        <ServiceTypeSection
          service={service}
          isDarkBackground={isDarkBackground}
        />
      </div>

      {/* Campo de cupón de descuento */}
      <FormField
        name="discount_coupon"
        control={form.control}
        render={({ field }) => (
          <div className="relative flex items-center">
            <img
              src="/images/services/cupon.png"
              alt="Discount Icon"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform"
            />
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

      {/* Subtotal */}
      <div className="flex justify-between">
        <div
          className={`text-sm font-medium leading-5 ${
            isDarkBackground ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {t('checkout.subtotal')}
        </div>
        <div
          className={`text-sm font-medium leading-5 ${
            isDarkBackground ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          ${(service.price! * quantity)?.toFixed(2)}
        </div>
      </div>

      {/* Descuento */}
      {discountAmount !== null && (
        <div className="flex justify-between text-green-600">
          <div className="text-sm font-medium leading-5">
            {t('checkout.discount')}
          </div>
          <div className="text-sm font-medium leading-5">
            -${(discountAmount * quantity).toFixed(2)}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between">
        <div
          className={`text-sm font-bold leading-5 ${
            isDarkBackground ? 'text-white' : 'text-gray-950'
          }`}
        >
          {t('checkout.total')} {`(${service.currency.toUpperCase()})`}
        </div>
        <div
          className={`text-sm font-bold leading-5 ${
            isDarkBackground ? 'text-white' : 'text-gray-950'
          }`}
        >
          ${(discountedTotal + 5)?.toFixed(2)}
        </div>
      </div>

      {/* Botón de suscripción */}
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
            {t('checkout.subscribe')}
            {loading && <Spinner className="ml-2 h-4 w-4" />}
          </ThemedButton>
        )}
      </div>

      {/* Mensaje de seguridad */}
      <div className="flex items-start gap-3">
        <img
          src="/images/services/security-icon.png"
          alt="Security Icon"
          className={`h-5 w-5 ${isDarkBackground ? 'invert filter' : ''}`}
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
