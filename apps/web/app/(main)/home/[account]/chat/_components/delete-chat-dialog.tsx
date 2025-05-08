import { useFormStatus } from 'react-dom';

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
import { Trans } from '@kit/ui/trans';

import { deleteChatAction } from '../_lib/server/server-actions';

export function DeleteChatDialog(
  props: React.PropsWithChildren<{
    chatReferenceId: string;
  }>,
) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey={'chats:deleteChatDialogTitle'} />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey={'chats:deleteChatDialogDescription'} />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>

          <form action={deleteChatAction}>
            <input
              type="hidden"
              name={'chatReferenceId'}
              value={props.chatReferenceId}
            />

            <DeleteChatButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteChatButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} variant={'destructive'}>
      <Trans i18nKey={'chats:deleteChat'} />
    </Button>
  );
}
