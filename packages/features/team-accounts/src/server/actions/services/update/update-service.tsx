'use client';

import React, { useState } from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel} from '@kit/ui/alert-dialog';
import { Pen } from 'lucide-react';
import { updateService } from './update-service-server';
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
import { Service } from '../../../../../../../../apps/web/lib/services.types';

const formSchema = z.object({
    id: z.number(),
    created_at: z.string(),
    name: z.string().min(2).max(50),
    price: z.number().min(2).max(15),
    number_of_clients: z.number(),
    status: z.string().min(2).max(20),
    propietary_organization_id: z.string(),
});

type UpdateServiceProps = {
    id: number,
    values: Service.Update
};

const UpdateServiceDialog = ({ id, values }: UpdateServiceProps) => {
    const { t } = useTranslation('services');
    const [selectedStatus, setSelectedStatus] = useState(status);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: values,
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await updateService(
            id,
            values,
    );
        window.location.reload();
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
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("servicePrice")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("servicepriceLabel")} {...field} />
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
                                <Button type="submit" className='w-full ' onClick={() => console.log("Submit button clicked")}>{t("updateService")}</Button>
                            </form>
                        </Form>
                    </AlertDialogDescription>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default UpdateServiceDialog;
