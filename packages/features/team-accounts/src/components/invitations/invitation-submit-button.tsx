'use client';

import { useFormStatus } from 'react-dom';



import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import { Trans } from '@kit/ui/trans';


export function InvitationSubmitButton(props: {
  accountName: string;
  email: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type={'submit'} className={'w-full flex gap-2'} disabled={pending}>
      {pending && <Spinner className="h-4 w-4 text-white" />}
      <Trans
        i18nKey={pending ? 'team:joiningTeam' : 'team:joinTeamAccount'}
        values={{
          accountName: props.accountName,
          email: props.email,
        }}
      />
    </Button>
  );
}