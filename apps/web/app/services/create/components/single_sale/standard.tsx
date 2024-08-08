import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { useTranslation } from 'react-i18next';

function Standard() {
    const { t } = useTranslation('services');

  return (
    <div>
        <FormField
            name="step_service_price.price"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('insert_price')}</FormLabel>
                    <FormControl>
                        <Input 
                            {...field} 
                            type="number" 
                            className='w-full flex'
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            name="step_service_price.purchase_limit"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('purchase_limit')}</FormLabel>
                    <FormControl>
                        <Input 
                            {...field} 
                            type="number" 
                            className='w-full flex'
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                    </FormControl>
                    <FormDescription>{t('purchase_limit_description')}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            name="step_service_price.allowed_orders"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('allowed_orders')}</FormLabel>
                    <FormControl>
                        <Input 
                            {...field} 
                            type="number" 
                            className='w-full flex'
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                    </FormControl>
                    <FormDescription>{t('allowed_orders_description')}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    </div>
  );
}

export default Standard;