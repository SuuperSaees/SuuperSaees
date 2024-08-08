import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { useTranslation } from 'react-i18next';

function CreditBased () {
    const { t } = useTranslation('services');
    return (
        <div>
            <div className='flex justify-between space-x-4'>
                            <FormField
                                  name="step_service_price.price"
                                  render={({ field }) => (
                                      <FormItem className='flex-grow'>
                                          <FormLabel>{t('insert_price')}</FormLabel>
                                          <FormControl>
                                              <Input 
                                                  {...field} 
                                                  type="number" 
                                                  className='w-full'
                                                  onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                                              />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                                <FormField
                                  name="step_service_price.credits"
                                  render={({ field }) => (
                                      <FormItem className='w-1/4'>
                                          <FormLabel>{t('credits')}</FormLabel>
                                          <FormControl>
                                              <Input 
                                                  {...field} 
                                                  type="number" 
                                                  className='w-full'
                                                  onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                                              />
                                          </FormControl>

                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>
                           
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
                                        <FormLabel>{t('credit_based_allowed_orders')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                type="number" 
                                                className='w-full flex'
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                                            />
                                        </FormControl>
                                        <FormDescription>{t('credit_based_allowed_orders_description')}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
        </div>
    )
}

export default CreditBased;