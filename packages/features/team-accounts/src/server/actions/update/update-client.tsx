'use client';

import React, { useState } from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@kit/ui/alert-dialog'; // Asegúrate de ajustar la importación según tu configuración
import { Pen } from 'lucide-react';
import { updateClient } from './update-client-server';
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
    id: z.string(),
    created_at: z.string(),
    name: z.string().min(2).max(50),
    client_organization: z.string().min(2).max(50),
    email: z.string().email(),
    role: z.string().min(2).max(50),
    propietary_organization: z.string(),
    propietary_organization_id: z.string(),
})

type CreateClientProps = {
  id: string;
  created_at?: string;
  name?: string;
  client_organization?: string;
  email?: string;
  role?: string;
  propietary_organization: string;
  propietary_organization_id: string;
}



const UpdateClientDialog = ( { id, created_at, name, client_organization, email, role, propietary_organization, propietary_organization_id }: CreateClientProps ) => {
    const [selectedRole, setSelectedRole] = useState("");
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: id,
            created_at: created_at,
            name: name,
            client_organization: client_organization,
            email: email,
            role: role,
            propietary_organization: propietary_organization,
            propietary_organization_id: propietary_organization_id,
        },
      })
     
      async function onSubmit(values: z.infer<typeof formSchema>) {
        await updateClient({
            ...values,
            picture_url: null
        })
        alert('Usuario actualizado correctamente.');
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
          <Pen className="h-4 w-4 text-gray-600 cursor-pointer" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className='flex '>
          <AlertDialogHeader>
            <AlertDialogTitle>Actualizar cliente</AlertDialogTitle>
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
                        <Button variant="outline">{selectedRole || role}</Button>
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
                    <Button type="submit" className='w-full '>Actualizar cliente</Button>
                </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpdateClientDialog;
