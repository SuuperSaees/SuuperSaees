'use client';

import { useState, useTransition } from 'react';

import { PlusCircle } from 'lucide-react';

import { useCaptchaToken } from '@kit/auth/captcha/client';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Trans } from '@kit/ui/trans';

import { TaskForm } from '../_components/task-form';
import { addTaskAction } from '../_lib/server/server-actions';

export function NewTaskDialog() {
  const [pending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className={'mr-1 h-4'} />
          <span>
            <Trans i18nKey={'tasks:addNewTask'} />
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'tasks:addNewTask'} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={'tasks:addNewTaskDescription'} />
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          SubmitButton={() => (
            <Button disabled={pending}>
              {pending ? (
                <Trans i18nKey={'tasks:addingTask'} />
              ) : (
                <Trans i18nKey={'tasks:addTask'} />
              )}
            </Button>
          )}
          onSubmit={(data) => {
            startTransition(async () => {
              try {
                await addTaskAction({ ...data, captchaToken });
              } finally {
                resetCaptchaToken();
                setIsOpen(false);
              }
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
