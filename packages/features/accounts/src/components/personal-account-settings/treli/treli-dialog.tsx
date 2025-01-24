'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kit/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@kit/ui/form";
import { Input } from "@kit/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ThemedButton } from "../../ui/button-themed-with-settings";
import { ThemedInput } from "../../ui/input-themed-with-settings";
import { Spinner } from "@kit/ui/spinner";
import { toast } from "sonner";
import { BillingAccounts } from "../../../../../../../apps/web/lib/billing-accounts.types";
import { CredentialsCrypto, EncryptedCredentials, TreliCredentials } from "../../../../../../../apps/web/app/utils/credentials-crypto";
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

type TreliAccount = {
id: string;
provider: string;
username: string;
credentials: {
  username: string;
  password: string;
};
}

export function TreliDialog({userId}: TreliDialogProps) {
const { t } = useTranslation('account');
const [loading, setLoading] = useState(false);
const [loadingDelete, setLoadingDelete] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState<string | null>(null);
const [open, setOpen] = useState(false);
const [existingAccount, setExistingAccount] = useState<TreliAccount | null>(null);

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    username: "",
    password: "",
  },
});

useEffect(() => {
  const fetchExistingAccount = async () => {
    try {
      const response = await fetch(`/api/v1/billing/accounts?accountId=${userId}`);
      const data = await response.clone().json() as {
        success: boolean;
        data?: BillingAccounts.Type[];
      }
      
      if (data.success && data.data) {
        const treliAccount = data.data.find((account: BillingAccounts.Type) => account.provider === 'treli');
        if (treliAccount) {
          // decrypt credentials
          const secretKey = Buffer.from(process.env.NEXT_PUBLIC_CREDENTIALS_SECRET_KEY ?? '', 'hex');
          const credentialsCrypto = new CredentialsCrypto(secretKey);
          const parsedCredentials: EncryptedCredentials = JSON.parse(
            treliAccount.credentials as string,
          );
          const decryptedCredentials = credentialsCrypto.decrypt<TreliCredentials>(parsedCredentials);
          setExistingAccount({
            id: treliAccount.id,
            provider: treliAccount.provider,
            username: decryptedCredentials.treli_user,
            credentials: {
              username: decryptedCredentials.treli_user,
              password: decryptedCredentials.treli_password,
            },
          });
          form.setValue('username', decryptedCredentials.treli_user);
          form.setValue('password', decryptedCredentials.treli_password);
        }
      }
    } catch (error) {
      console.error('Error fetching existing account:', error);
    }
  };

  if (userId) {
    fetchExistingAccount().catch((error) => {
      console.error('Error fetching existing account:', error);
    });
  }
}, [userId, form]);

async function onSubmit(values: z.infer<typeof formSchema>) {
  setLoading(true);
  try {
      await handleAddTreliAccount({
        username: values.username,
        password: values.password
      });
  
  } catch (error: unknown) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unknown error occurred');
    }
    console.error(error);
  } finally {
    setLoading(false);
  }
}

const handleAddTreliAccount = async ({username, password}: HandleAddTreliProps) => {
  const res = await fetch(`/api/v1/billing/accounts?accountId=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
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

const handleDeleteTreliAccount = async () => {
  if (!existingAccount) return;
  
  setLoadingDelete(true);
  try {
    const res = await fetch(`/api/v1/billing/accounts/${existingAccount.id}?accountId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (data.error) {
      toast.error(data.error.message);
      setError(data.error.message);
      throw new Error(data.error.message);
    }

    if (data.success) {
      toast.success(t('treli.deleteSuccess'));
      setExistingAccount(null);
      form.reset();
      setOpen(false);
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    toast.error(t('treli.deleteError'));
  } finally {
    setLoadingDelete(false);
  }
};

return (
  <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogTrigger asChild onClick={() => setOpen(true)}>
      <ThemedButton className="w-full">
        {existingAccount ? t('treli.update') : t('treli.continue')}
      </ThemedButton>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {existingAccount ? t('treli.updateData') : t('treli.insertData')}
        </AlertDialogTitle>
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
                      <div className="relative">
                      <ThemedInput
                        required
                        data-test={'password-input'}
                        type={showPassword ? "text" : "password"}
                        placeholder={''}
                        {...field}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          field.onChange(e);
                          form.setValue('password', e.target.value);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <Eye className="h-4 w-4 text-gray-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                    </button>
                  </div>
                    </FormControl>
                    <FormDescription>
                      {t('treli.passwordDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-2">
              {existingAccount && (
              <ThemedButton 
                variant="danger" 
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={loadingDelete}
                onClick={handleDeleteTreliAccount}
              >
                {loadingDelete ? <Spinner className="w-4 h-4" /> : t('treli.delete')}
              </ThemedButton>
                )}
                <AlertDialogCancel onClick={() => {
                  if (!existingAccount) {
                    form.reset();
                    setError('');
                  } else {
                    setOpen(false);
                  }
                }}>
                  {t('treli.cancel')}
                </AlertDialogCancel>
                <ThemedButton type="submit">
                  {loading ? <Spinner className="w-4 h-4" /> : 
                    existingAccount ? t('treli.update') : t('treli.continue')}
                </ThemedButton>
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