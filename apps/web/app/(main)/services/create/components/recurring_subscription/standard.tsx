'use client';

import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@kit/ui/select"
import { Switch } from '@kit/ui/switch';
import { Label } from '@kit/ui/label';

function StandardRecurringSubscription() {
    const { t } = useTranslation('services');
    const [isTestPeriod, setIsTestPeriod] = useState(false);

    const recurrenceOptions = [
        { value: 'day', label: t('daily') },
        { value: 'week', label: t('weekly') },
        { value: 'month', label: t('monthly') },
        { value: 'year', label: t('yearly') },
    ];

    const UnitOfMeasurementOptions = [
        { value: 'day', label: t('days') },
        { value: 'week', label: t('weeks') },
        { value: 'month', label: t('months') },
        { value: 'year', label: t('years') },
    ];

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
                                        <FormField
                                            name="step_service_price.currency"
                                            render={({ field: currencyField }) => (
                                                <Select
                                                    onValueChange={currencyField.onChange}
                                                    defaultValue={currencyField.value}
                                                >
                                                    <SelectTrigger className="w-[80px] border-none">
                                                        <SelectValue placeholder="USD" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD</SelectItem>
                                                        <SelectItem value="COP">COP</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    name="step_service_price.recurrence"
                    render={({ field }) => (
                        <FormItem className='w-1/4'>
                            <FormLabel>{t('recurrence')}</FormLabel>
                            <FormControl>
                                <Select 
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('select_recurrence')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recurrenceOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
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
            <div className='mb-[16px]'>
                <FormField
                    name="step_service_price.test_period"
                    render={({ field }) => (
                        <div className="flex items-center space-x-2 mt-4 mb-4">
                            <FormControl>
                                <Switch 
                                    id="test-period"
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        setIsTestPeriod(checked);
                                    }}
                                />
                            </FormControl>
                            <Label htmlFor="test-period">{t('test_period_offert')}</Label>
                        </div>
                    )}
                />
            </div>
            <div className='flex justify-between space-x-4'>
                <div className='mb-[16px] w-full'>
                    <FormField
                        name="step_service_price.test_period_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('test_period_price')}</FormLabel>
                                <FormControl>
                                    <div className="w-full flex items-center border rounded-md transition-colors duration-200 ease-in-out border-gray-300 focus-within:border-purple-600">
                                        <span className="text-gray-600 text-[16px] font-normal leading-[24px] ml-[14px]">$</span>
                                        <input 
                                            {...field} 
                                            type="number" 
                                            className="text-gray-600 text-[16px] font-normal leading-[24px] flex-1 px-2 py-1 border-none focus:ring-0 focus:outline-none focus:border-none"
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            disabled={!isTestPeriod}
                                        />
                                        <FormField
                                            name="step_service_price.test_period_currency"
                                            render={({ field: currencyField }) => (
                                                <Select
                                                    onValueChange={currencyField.onChange}
                                                    defaultValue={currencyField.value}
                                                    disabled={!isTestPeriod}
                                                >
                                                    <SelectTrigger className="w-[80px] border-none">
                                                        <SelectValue placeholder="USD" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD</SelectItem>
                                                        <SelectItem value="COP">COP</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription>{t('test_period_description')}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className='flex flex-col'>
                    <Label className='mb-4'>{t('test_period_time')}</Label>
                    <div className='flex items-center'>
                        <FormField
                            name="step_service_price.test_period_duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="number" 
                                            className='w-full'
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                                            disabled={!isTestPeriod}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="step_service_price.test_period_duration_unit_of_measurement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}
                                            disabled={!isTestPeriod}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t('select_unit_of_measurement')}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {UnitOfMeasurementOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
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
            {/* //At this time we will only handle standard for one-time payment and subscription */}

        {/* <div className='flex justify-between space-x-4'>
            <FormField
                name="step_service_price.max_number_of_simultaneous_orders"
                render={({ field }) => (
                    <FormItem className='w-1/2'>
                        <FormLabel>{t('max_number_of_simultaneous_orders')}</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                type="number" 
                                className='w-full'
                                onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            />
                        </FormControl>
                        <FormDescription>{t('max_number_of_simultaneous_orders_description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                name="step_service_price.max_number_of_monthly_orders"
                render={({ field }) => (
                    <FormItem className='w-1/2'>
                        <FormLabel>{t('max_number_of_monthly_orders')}</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                type="number" 
                                className='w-full'
                                onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            />
                        </FormControl>
                        <FormDescription>{t('max_number_of_monthly_orders_description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div> */}
        </div>
    );
}

export default StandardRecurringSubscription;