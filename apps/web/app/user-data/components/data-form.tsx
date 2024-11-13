'use client';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from '@kit/ui/form';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

const formSchema = z.object({
    portalUrl: z.string().min(2).max(50),
    userFullName: z.string().min(2).max(50),
    userphoneNumber: z.string().min(2).max(50).regex(/^\d+$/, "Solo se permiten números"),
})

export function UserDataForm(
  {userId, tokenId}: {userId: string, tokenId: string}
) {
  const supabase = useSupabase();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portalUrl: "",
      userFullName: "",
      userphoneNumber: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
    await supabase.from('tokens')
    .update({
        expires_at: new Date().toISOString(),
    })
    .eq('id_token_provider', tokenId);
    await supabase.from('accounts')
    .update({
        name: data.userFullName,
    })
    .eq('id', userId);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
          control={form.control}
          name="portalUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portal URL</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                https://portal.example.com
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userphoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="123456789" {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}