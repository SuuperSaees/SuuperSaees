'use client';

import { useTransition } from 'react';

import { z } from 'zod';

import { useCaptchaToken } from '@kit/auth/captcha/client';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { TaskForm } from '~/(main)/home/(user)/_components/task-form';
import { WriteTaskSchema } from '~/(main)/home/(user)/_lib/schema/write-task.schema';
import { updateTaskAction } from '~/(main)/home/(user)/_lib/server/server-actions';

export function UpdateTask(props: {
  task: z.infer<typeof WriteTaskSchema> & { id: string };
}) {
  const [pending, startTransition] = useTransition();
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();

  return (
    <div>
      <TaskForm
        task={props.task}
        SubmitButton={() => (
          <div>
            <Button disabled={pending}>
              {pending ? (
                <Trans i18nKey={'tasks:updatingTask'} />
              ) : (
                <Trans i18nKey={'tasks:updateTask'} />
              )}
            </Button>
          </div>
        )}
        onSubmit={(data) => {
          startTransition(async () => {
            try {
              await updateTaskAction({
                ...data,
                id: props.task.id,
                captchaToken,
              });
            } finally {
              resetCaptchaToken();
            }
          });
        }}
      />
    </div>
  );
}
