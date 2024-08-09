'use client';

import React, { useState } from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from '@kit/ui/alert-dialog'; 
import { createClient } from './create-client-server';
import { Button } from '@kit/ui/button';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@kit/ui/form"
import { Input } from "@kit/ui/input"
import { Separator } from '@kit/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@kit/ui/dropdown-menu"
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
    name: z.string().min(2).max(50),
    client_organization: z.string().min(2).max(50),
    email: z.string().email(),
    role: z.string().min(2).max(50),
})

type CreateClientProps = {
    propietary_organization: string;
    propietary_organization_id: string;
}


const CreateClientDialog = ( { propietary_organization, propietary_organization_id }: CreateClientProps ) => {
    const [selectedRole, setSelectedRole] = useState("");
    const { t } = useTranslation('clients');
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            client_organization: "",
            email: "",
            role: "",
        },
      })
     
      async function onSubmit(values: z.infer<typeof formSchema>) {
        await createClient({
            ...values,
            picture_url: "",
            propietary_organization,
            propietary_organization_id
        })
        window.location.reload();
      }

      const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        form.setValue("role", role);
      }
      

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
        <Button>
          {t("createClient")}
        </Button>
        </AlertDialogTrigger>
        <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className='flex justify-between w-full items-center'>
          <AlertDialogHeader>
              <AlertDialogTitle>
                {t("createClient")} 
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
                        <FormLabel>{t("clientName")}</FormLabel>
                        <FormControl>
                            <Input placeholder={t("nameLabel")} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("clientEmail")}</FormLabel>
                        <FormControl>
                            <Input placeholder={t("emailLabel")} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="client_organization"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("organizationName")}</FormLabel>
                        <FormControl>
                            <Input placeholder={t("organizationLabelInput")} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("roleSelection")}</FormLabel>
                        <FormControl>
                            <Input className='hidden' {...field} value={selectedRole} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                              {selectedRole ? t(selectedRole) : t("role")}
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>{t("roleSelection")}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => handleRoleSelect("member")}>
                                  {t("member")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleSelect("leader")}>
                                  {t("leader")}
                              </DropdownMenuItem>
                          </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Separator/>
                    <Button type="submit" className='w-full '>Crear cliente</Button>
                </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreateClientDialog;
