'use client';

import React, { useState } from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel} from '@kit/ui/alert-dialog';
import { Pen } from 'lucide-react';
import { updateService } from 'node_modules/@kit/team-accounts/src/server/actions/services/update/update-service-server';
import { Button } from '@kit/ui/button';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@kit/ui/form";
import { Input } from "@kit/ui/input";
import { Separator } from '@kit/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@kit/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';
import { Service } from '~/lib/services.types';
import { useServicesContext } from '../contexts/services-context';

const formSchema = z.object({
    name: z.string().min(2).max(50),
    price: z.number().min(0),
    status: z.string().min(2).max(20),
});

type UpdateServiceProps = {
    valuesOfServiceStripe: Service.Type
};

const UpdateServiceDialog = ({valuesOfServiceStripe }: UpdateServiceProps) => {
    const { t } = useTranslation('services');
    const { updateServices } = useServicesContext();
    const [selectedStatus, setSelectedStatus] = useState(valuesOfServiceStripe.status);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: valuesOfServiceStripe.name,
            price: valuesOfServiceStripe.price,
            status: valuesOfServiceStripe.status,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await updateService(
            values.status,
            {
            step_service_details:{
                service_image: valuesOfServiceStripe.service_image!,
                service_name: values.name,
            },
            step_service_price: {
                price: Number(values.price),
                price_id: valuesOfServiceStripe.price_id!,
             }   
            },
    );
    await updateServices(false);
    }

    const handleRoleSelect = (status: string) => {
        setSelectedStatus(status);
        form.setValue("status", status);
    };

    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Pen className="h-4 w-4 text-gray-600 cursor-pointer" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <div className='flex justify-between w-full items-center'>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("updateService")}
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogCancel className="text-red-500 hover:text-red-700 font-bold">X</AlertDialogCancel>
                    </div>
                    <AlertDialogDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("serviceName")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("serviceNameLabel")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>{t("servicePrice")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("servicepriceLabel")} defaultValue={form.getValues().price} onChange={(event)=>{
                                                    const {value} = event.target
                                                    form.setValue("price", Number(value))}} type='number' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("statusSelection")}</FormLabel>
                                            <FormControl>
                                                <Input className='hidden' {...field} value={selectedStatus} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            {selectedStatus ? t(selectedStatus) : t("status")}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>{t("statusSelection")}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => handleRoleSelect("active")}>
                                                {t("active")}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleSelect("draft")}>
                                                {t("draft")}
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Separator />
                                <AlertDialogCancel className="w-full p-0"><Button type="submit" className='w-full '>{t("updateService")}</Button></AlertDialogCancel>
                            </form>
                        </Form>
                    </AlertDialogDescription>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default UpdateServiceDialog;
