'use client';

import React, { useState } from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@kit/ui/alert-dialog'; 
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

type ExpectedFormValues = {
    id?: string | null
    created_at?: string | null
    name: string
    picture_url: string | null
    client_organization: string
    email: string
    role: string
    propietary_organization: string
    propietary_organization_id: string
}



const CreateClientDialog = ( { propietary_organization, propietary_organization_id }: CreateClientProps ) => {
    const [selectedRole, setSelectedRole] = useState("");
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
            picture_url: null,
            propietary_organization,
            propietary_organization_id
        })
        alert('Usuario creado correctamente');
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
          Crear cliente
        </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className='flex '>
          <AlertDialogHeader>
            <AlertDialogTitle>Crear cliente</AlertDialogTitle>
          </AlertDialogHeader>
          </div>
          <AlertDialogDescription>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                            <Input placeholder="Ingresa su nombre" {...field} />
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
                        <FormLabel>Correo </FormLabel>
                        <FormControl>
                            <Input placeholder="Ingresa su correo electrónico" {...field} />
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
                        <FormLabel>Nombre de la organización</FormLabel>
                        <FormControl>
                            <Input placeholder="Ingresa el nombre de su organización" {...field} />
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
                        <FormLabel>Selecciona su rol</FormLabel>
                        <FormControl>
                            <Input className='hidden' {...field} value={selectedRole} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* <Button variant="outline">Rol</Button> */}
                        <Button variant="outline">{selectedRole || "Rol"}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Selecciona un rol</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleRoleSelect("Miembro")}>
                            Miembro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleSelect("Líder")}>
                            Líder
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
