import { useState } from 'react';

import { useFormStatus } from 'react-dom';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { renameChatAction } from '../_lib/server/server-actions';

export function RenameChatDialog(
  props: React.PropsWithChildren<{
    chatReferenceId: string;
    chatName: string;
  }>,
) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: props.chatName,
      referenceId: props.chatReferenceId,
    },
  });

  const { t } = useTranslation('chats');

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('renameChatDialogTitle')}</AlertDialogTitle>

          <AlertDialogDescription>
            {t('renameChatDialogDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              await renameChatAction(values);
              setOpen(false);
            })}
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('chatName')}</FormLabel>

                  <FormControl>
                    <Input {...field} type="text" />
                  </FormControl>
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>
                <Trans i18nKey={'common:cancel'} />
              </AlertDialogCancel>

              <RenameChatButton />
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RenameChatButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending}>
      <Trans i18nKey={'chats:renameChat'} />
    </Button>
  );
}
