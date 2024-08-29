'use client';

import React, { useState } from 'react';
import { createOrganizationServer } from '../../../../../packages/features/team-accounts/src/server/actions/organizations/create/create-organization-server';
import { Button } from '@kit/ui/button';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@kit/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@kit/ui/form"
import { Input } from "@kit/ui/input"
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';

const formSchema = z.object({
    organization_name: z.string().min(2).max(50),
})



const CreateOrganization = ( ) => {
    const { t } = useTranslation('organizations');
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            organization_name: ""
        },
      })
     
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      async function onSubmit(values: z.infer<typeof formSchema>) {
        await createOrganizationServer({
            ...values
        })
        setIsDialogOpen(true); 
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 bg-white rounded-lg">
            <div className="flex items-center justify-center mb-8">
                <Button variant="outline" className="pointer-events-none">
                    <KeyRound size={24} />
                </Button>
            </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="organization_name"
                            render={({ field }) => (
                                <FormItem className='flex flex-col items-center justify-center mb-[24px]'>
                                    <FormLabel className='text-gray-900 text-center font-inter text-3xl font-semibold leading-[38px] mb-[32px]'>{t("organizationName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("organizationLabel")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='w-full'>
                            {t('continue')}
                        </Button>
                    </form>
                </Form>
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger asChild>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('successAgency')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('successAgencyDescription')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Link href="/home">
                                <AlertDialogAction>{t('continue')}</AlertDialogAction>
                            </Link>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
      
};

export default CreateOrganization;
