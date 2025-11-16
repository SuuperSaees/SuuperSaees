'use client';

import { useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {saveToken} from '../../../../tokens/src/save-token'
import {generateUUID} from '../../../../../apps/web/app/utils/generate-uuid'
import {formatToTimestamptz} from '../../../../../apps/web/app/utils/format-to-timestamptz'
import { Trans } from '@kit/ui/trans';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import {
  Form,
} from '@kit/ui/form';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

import { impersonateUserAction } from '../lib/server/admin-server-actions';
import { ImpersonateUserSchema } from '../lib/server/schema/admin-actions.schema';
import { useRouter } from 'next/navigation';
import { revalidateSession } from '../../../../../apps/web/app/server/actions/accounts/accounts.action';

export function AdminImpersonateUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
  }>,
) {
  const form = useForm({
    resolver: zodResolver(ImpersonateUserSchema),
    defaultValues: {
      userId: props.userId,
    },
  });

  useEffect(() => {
    form.reset({
      userId: props.userId,
    });
  }, [props.userId, form]);

  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  }>();

  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = props.isOpen !== undefined && props.setIsOpen !== undefined;
  const isOpen = isControlled ? props.isOpen : internalIsOpen;
  const setIsOpen = isControlled ? props.setIsOpen : setInternalIsOpen;

  if (tokens) {
    return (
      <>
        <ImpersonateUserAuthSetter tokens={tokens} />
      </>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle><Trans i18nKey={'clients:editUser:supplant'} /></AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey={'clients:editUser:supplantDescription'} />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            className={'flex flex-col space-y-8'}
            onSubmit={form.handleSubmit(
              async (data) => {
                localStorage.clear();
                const tokens = await impersonateUserAction(data);
                setTokens(tokens);
              },
              (errors) => {
                console.error('Validation errors:', errors);
              }
            )}
          >

            <AlertDialogFooter>
              <AlertDialogCancel><Trans i18nKey={'clients:editUser:cancelSupplant'} /></AlertDialogCancel>

              <Button type={'submit'}><Trans i18nKey={'clients:editUser:confirmSupplant'} /></Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ImpersonateUserAuthSetter({
  tokens,
}: React.PropsWithChildren<{
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}>) {
  useSetSession(tokens);

  return <LoadingOverlay>Setting up your session...</LoadingOverlay>;
}

function useSetSession(tokens: { accessToken: string; refreshToken: string }) {
  const supabase = useSupabase();
  const router = useRouter();

  const domain = (typeof window !== 'undefined' 
    ? window.location.origin.replace(/^https?:\/\//, '')
    : '');

  return useQuery({
    queryKey: ['impersonate-user', tokens.accessToken, tokens.refreshToken],
    gcTime: 0,
    queryFn: async () => {
      try{
        //Saving previous session to enable 'stop impersonating' feature
        const session = await supabase.auth.getSession();
        const expires_at = session.data.session ? new Date(parseInt(session.data.session.expires_at!.toString()) * 1000) : new Date();
        const tokenId = generateUUID()
        const sessionToStore = session.data.session ? { access_token: session.data.session.access_token, refresh_token: session.data.session.refresh_token, expires_at: formatToTimestamptz(expires_at), provider:'supabase', id_token_provider:tokenId} : { access_token: '', refresh_token: '', expires_at: '',provider:'supabase', id_token_provider:tokenId};
        await saveToken(sessionToStore);
        localStorage.setItem('impersonatingTokenId', tokenId)

        await supabase.auth.setSession({
          refresh_token: tokens.refreshToken,
          access_token: tokens.accessToken,
        });

        await supabase.rpc('set_session', {
          domain,
        })

        await revalidateSession();
        
        //Push to /home page and then use refresh to reload the page with updated user data
        router.push('/home');
        window.location.reload();
        router.refresh()
        return tokenId

        // This one below is no longer used to prevent useContext errors
        // window.location.replace('/home');

      }catch(error){
        console.error(error)
      }
      
    },
  });
}
