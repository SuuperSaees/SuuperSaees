import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { useTranslation } from 'react-i18next';


function TimeBased() {
    const { t } = useTranslation('services');
    return (
        <div>
            <div className='flex justify-between space-x-4'>
                <div className='mb-[16px] w-full'>
                    <FormField
                        name="step_service_price.price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('insert_price')}</FormLabel>
                                <FormControl>
                                    <div className="w-full flex items-center border rounded-md transition-colors duration-200 ease-in-out border-gray-300 focus-within:border-purple-600">
                                        <span className="text-gray-600 text-[16px] font-normal leading-[24px] ml-[14px]">$</span>
                                        <input 
                                            {...field} 
                                            type="number" 
                                            className="text-gray-600 text-[16px] font-normal leading-[24px] flex-1 px-2 py-1 border-none focus:ring-0 focus:outline-none focus:border-none"
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                        <span className="text-gray-600 text-[16px] font-normal leading-[24px] mr-[14px]">USD</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    name="step_service_price.hours"
                    render={({ field }) => (
                        <FormItem className='w-1/4'>
                            <FormLabel>{t('hours')}</FormLabel>
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
            <div className='mb-[16px]'>
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
            </div>
            <FormField
                name="step_service_price.allowed_orders"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('time_based_allowed_orders')}</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                type="number" 
                                className='w-full flex'
                                onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            />
                        </FormControl>
                        <FormDescription>{t('time_based_allowed_orders_description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}

export default TimeBased;