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

import { FormData, ServiceType } from '../types/billing-form-types';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface SideDataFieldsProps {
  form: UseFormReturn<FormData>;
  service: ServiceType;
  loading: boolean;
  errorMessage: string;
  accountId: string;
  validSuccess: boolean;
}

export const SideInfo: React.FC<SideDataFieldsProps> = ({ form, service, loading, errorMessage, accountId, validSuccess }) => {
  const defaultServiceImage = process.env.NEXT_PUBLIC_SERVICE_DEFAULT_IMAGE;
  const { t } = useTranslation('services');
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const handleApplyDiscount = async () => {
    const discountCode = form.getValues("discount_coupon");
    setIsApplyingDiscount(true);

    try {
      const response = await fetch('/api/stripe/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountCode, accountId, servicePrice: service.price }),
      });
      const data = await response.json();

      if (response.ok && data.discountAmount) {
        setDiscountAmount(data.discountAmount);
      } else {
        setDiscountAmount(null); // No discount if invalid code
        form.setError("discount_coupon", { message: "Cupón inválido" });
      }
    } catch (error) {
      console.error("Failed to apply discount:", error);
      setDiscountAmount(null);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const discountedTotal = discountAmount ? (service.price ?? 0) - discountAmount : service.price;
  return (
    <div>
      <div className="font-inter mb-4 text-2xl font-semibold leading-[1.27] text-gray-900">
        {t('checkout.resume')}
      </div>
      {service.service_image ? (
          <img src={service.service_image} alt="Service Image" className="object-cover w-full w-[390px] h-[190px] rounded-lg"/>
        ) : (
          <img src={defaultServiceImage} alt="Service Image" className="object-cover w-full w-[390px] h-[190px] rounded-lg"/>
          
        )}
      <div className="my-[18px] flex items-center">
        <div className="flex flex-1 justify-between">
          <div className="text-sm font-medium leading-5 text-gray-700">
            {service.name}
          </div>
          <div className="text-sm font-medium leading-5 text-gray-700">
            ${service.price?.toFixed(2)}
          </div>
        </div>
      </div>
      <FormField
        name="discount_coupon"
        control={form.control}
        render={({ field }) => (
          <FormItem className="mb-[18px] w-full">
            <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
              {t('checkout.discount_coupon')}
            </FormLabel>
            <FormControl>
              <div className="flex gap-4">
                <Input {...field} />
                <Button
                  variant="ghost"
                  type="button"
                  className="border border-gray-300"
                  onClick={handleApplyDiscount}
                  disabled={isApplyingDiscount}
                >
                  {isApplyingDiscount ? <Spinner className='h-4 w-4'/> : t('checkout.apply')}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="mb-[18px] flex justify-between">
        <div className="text-sm font-medium leading-5 text-gray-700">
          {t('checkout.subtotal')}
        </div>
        <div className="text-sm font-medium leading-5 text-gray-700">
          ${service.price?.toFixed(2)}
        </div>
      </div>
      {discountAmount !== null && (
        <div className="mb-[18px] flex justify-between text-green-600">
          <div className="text-sm font-medium leading-5">
            {t('checkout.discount')}
          </div>
          <div className="text-sm font-medium leading-5">
            -${discountAmount.toFixed(2)}
          </div>
        </div>
      )}
      <div className="mb-[18px] flex justify-between">
        <div className="text-sm font-medium leading-5 text-gray-700">
          {t('checkout.total')}
        </div>
        <div className="text-sm font-medium leading-5 text-gray-700">
          ${discountedTotal?.toFixed(2)}
        </div>
      </div>
      <div className="mb-[18px] text-sm font-medium leading-5 text-gray-700">
        {t('checkout.accept_terms')}
      </div>
      {validSuccess ? (
        <Button
          type="button"
          className="w-full bg-green-600 text-white transition duration-300 ease-in-out transform hover:scale-105"
        >
          <CheckCircle className="mr-2 h-4 w-4 text-white transition-opacity duration-300" />
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white transition duration-300 ease-in-out transform hover:scale-105"
        >
          {t('checkout.subscribe')}
          {loading && <Spinner className="ml-2 h-4 w-4" />}
        </Button>
      )}
      <div>
        {errorMessage && (
          <div className="text-sm font-medium leading-5 text-red-500">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
