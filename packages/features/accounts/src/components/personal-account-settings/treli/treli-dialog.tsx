'use-client';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@kit/ui/alert-dialog";
import { ThemedButton } from "../../ui/button-themed-with-settings";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@kit/ui/form";
import { Input } from "@kit/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@kit/ui/button";
import { useState } from "react";
import { Spinner } from "@kit/ui/spinner";
import { toast } from "sonner";
 
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

type HandleAddTreliProps = {
  username: string;
  password: string;
};

type TreliDialogProps = {
  userId: string | undefined;
}

export function TreliDialog(
  {
    userId
  }: TreliDialogProps
) {
  const { t } = useTranslation('account');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      await handleAddTreliAccount({
        username: values.username,
        password: values.password
      })
    } catch (error) {
      setError(error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTreliAccount = async ({
    username,
    password
  }: HandleAddTreliProps) => {
    const res = await fetch(`/api/v1/billing/accounts?accountId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        namespace: 'production',
        provider: 'treli'
      }),
    });
  
    const data = await res.json();
  
    if (data.error) {
      toast.error(data.error.message);
      setError(data.error.message);
      throw new Error(data.error.message);
    }

    if (data.success) {
      toast.success(t('treli.success'));
      setOpen(false);
    }
  };


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild onClick={() => setOpen(true)}>
        <ThemedButton className="w-full">
            {t('treli.continue')}
          </ThemedButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('treli.insertData')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('treli.username')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('treli.usernameDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('treli.password')}</FormLabel>
                      <FormControl>
                        <Input {...field} type='password'/>
                      </FormControl>
                      <FormDescription>
                        {t('treli.passwordDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-end gap-2">
                  <AlertDialogCancel onClick={() => {form.reset(); setError('')}}>{t('treli.cancel')}</AlertDialogCancel>
                  <Button type="submit">{loading ? <Spinner className="w-4 h-4" />: t('treli.continue')  }</Button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </form>
            </Form>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}