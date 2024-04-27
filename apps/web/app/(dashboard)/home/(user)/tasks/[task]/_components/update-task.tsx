'use client';

import { useTransition } from 'react';

import { z } from 'zod';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { TaskForm } from '~/(dashboard)/home/(user)/_components/task-form';
import { WriteTaskSchema } from '~/(dashboard)/home/(user)/_lib/schema/write-task.schema';
import { updateTaskAction } from '~/(dashboard)/home/(user)/_lib/server/server-actions';

export function UpdateTask(props: {
  task: z.infer<typeof WriteTaskSchema> & { id: string };
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <TaskForm
        task={props.task}
        SubmitButton={() => (
          <div>
            <Button>
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
            await updateTaskAction({ ...data, id: props.task.id });
          });
        }}
      />
    </div>
  );
}
