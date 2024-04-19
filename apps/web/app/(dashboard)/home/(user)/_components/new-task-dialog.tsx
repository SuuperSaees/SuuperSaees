'use client';

import { useState, useTransition } from 'react';

import { PlusCircle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';

import { TaskForm } from '~/(dashboard)/home/(user)/_components/task-form';

import { addTaskAction } from '../server-actions';

export function NewTaskDialog() {
  const [pending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className={'mr-1 h-4'} />
          <span>Add a Task</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Task</DialogTitle>

          <DialogDescription>
            Fill out the form below to add a new task
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          SubmitButton={() => (
            <Button>{pending ? 'Adding...' : 'Add Task'}</Button>
          )}
          onSubmit={(data) => {
            startTransition(async () => {
              await addTaskAction(data);
              setIsOpen(false);
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
