"use client";

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@kit/ui/form';
import { Service } from '~/lib/services.types';
import Image from 'next/image';
import { Trans } from '@kit/ui/trans';
import { Separator } from '@kit/ui/separator';
import { Input } from '@kit/ui/input';
import { Button } from '@kit/ui/button';
import { buyService } from '../../../../../../../packages/features/team-accounts/src/server/actions/services/buy/buy-service'
import { Switch } from '@kit/ui/switch';
import { Label } from '@kit/ui/label';

type ServiceType = Service.Type;

const formSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    address: z.string(), 
    city: z.string(),
    country: z.string(),
    state_province_region: z.string(),
    postal_code: z.string(),
    buying_for_organization: z.boolean().default(false),
    enterprise_name: z.string(),
    tax_code: z.string(),
    discount_coupon: z.string(),
});

const BillingForm: React.FC<{ service: ServiceType }> = ({ service }) => {
    const [isBuyingForOrganization, setIsBuyingForOrganization] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            address: "",
            city: "",
            country: "",
            state_province_region: "",
            postal_code: "",
            buying_for_organization: false,
            enterprise_name: "",
            tax_code: "",
            discount_coupon: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await buyService(
            {
                ...values
            }
        )
        // window.location.reload();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className='flex gap-8'>
                    <div className='w-[831px]'>
                        <div className="text-gray-900 font-inter text-2xl font-semibold leading-[1.27]">
                            <Trans i18nKey={'services:checkout:billing_details'} />
                        </div>
                        <div className='flex mb-[20px]'>
                            <div className="w-[390px] h-[190px] rounded-md bg-[#D9D9D9] flex items-center justify-center overflow-hidden">
                                {service.service_image ? (
                                    <Image
                                        alt='Service Image'
                                        src={service.service_image}
                                        width={390}  
                                        height={190} 
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500">No image available</span>
                                )}
                            </div>
                            <div>
                                {service.service_description}
                            </div>
                        </div>
                        <Separator />
                        <div className="text-gray-800 font-inter text-base font-semibold leading-6 mt-[20px]">
                            <Trans i18nKey={'services:checkout:billing_data_label'} />
                        </div>
                        <div className='flex items-center gap-4'>
                            <FormField
                                name="fullName"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                        <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:full_name'} /></FormLabel>
                                        <FormControl>
                                            <Input  {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                        <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:email'} /></FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-4 mt-4'>
                            <FormField
                                name="address"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                         <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:address'} /></FormLabel>
                                        <FormControl>
                                            <Input  {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="city"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                         <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:city'} /></FormLabel>
                                        <FormControl>
                                            <Input  {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-4 mt-4'>
                            <FormField
                                name="country"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                         <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:country'} /></FormLabel>
                                        <FormControl>
                                            <Input  {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="state_province_region"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                         <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:state_province'} /></FormLabel>
                                        <FormControl>
                                            <Input  {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="postal_code"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                         <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:postal_code'} /></FormLabel>
                                        <FormControl>
                                            <Input  {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='mb-[16px]'>
                            <FormField
                                name="buying_for_organization"
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2 mt-4 mb-4">
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
                                        <Label htmlFor="buying_for_organization"><Trans i18nKey={'services:checkout:buying_for_organization'} /></Label>
                                    </div>
                                )}
                            />
                        </div>
                        {isBuyingForOrganization && (
                            <>
                                <div className='flex items-center gap-4 mt-4'>
                                    <FormField
                                        name="enterprise_name"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem className='w-full'>
                                                 <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:enterprise_name'} /></FormLabel>
                                                <FormControl>
                                                    <Input  {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="tax_code"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem className='w-full'>
                                                 <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:tax_code'} /></FormLabel>
                                                <FormControl>
                                                    <Input  {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className='flex flex-col'>
                        <div className="text-gray-900 font-inter text-2xl font-semibold leading-[1.27]">
                            <Trans i18nKey={'services:checkout:resume'} />
                        </div>
                        <div className='flex items-center mb-[18px]'>
                            {service.service_image ? (
                                <Image
                                    alt='Service Image'
                                    src={service.service_image}
                                    width={50}
                                    height={50}
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-gray-500">No image available</span>
                            )}
                            <div className='flex-1 ml-4 flex justify-between'>
                                <div className='text-sm font-medium leading-5 text-gray-700'>{service.name}</div>
                                <div className='text-sm font-medium leading-5 text-gray-700'>${service.price}</div>
                            </div>
                        </div>
                        <FormField
                            name="discount_coupon"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className='w-full mb-[18px]'>
                                        <FormLabel className='text-sm font-medium leading-[20px] text-gray-700'><Trans i18nKey={'services:checkout:discount_coupon'} /></FormLabel>
                                    <FormControl>
                                        <div className='flex gap-4'>
                                        <Input  {...field} />
                                        <Button variant='ghost' type='button' className='border border-gray-300'>
                                            <Trans i18nKey={'services:checkout:apply'} />
                                        </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex justify-between mb-[18px]'>
                            <div className='text-gray-700 text-sm font-medium leading-5'><Trans i18nKey={'services:checkout:subtotal'}/></div>
                            <div className='text-sm font-medium leading-5 text-gray-700'>${service.price}</div>
                        </div>
                        <div className='flex justify-between mb-[18px]'>
                            <div className='text-gray-700 text-sm font-medium leading-5'><Trans i18nKey={'services:checkout:total'}/></div>
                            <div className='text-sm font-medium leading-5 text-gray-700'>${service.price}</div>
                        </div>
                        <div className='text-gray-700 text-sm font-medium leading-5 mb-[18px]'><Trans i18nKey={'services:checkout:accept_terms'}/></div>
                        <Button type="submit" className='w-full '><Trans i18nKey={'services:checkout:subscribe'} /></Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default BillingForm;
