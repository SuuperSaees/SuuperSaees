import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { WriteTaskSchema } from '../_lib/schema/write-task.schema';

export function TaskForm(props: {
  task?: z.infer<typeof WriteTaskSchema>;
  onSubmit: (task: z.infer<typeof WriteTaskSchema>) => void;
  SubmitButton: React.ComponentType;
}) {
  const form = useForm({
    resolver: zodResolver(WriteTaskSchema),
    defaultValues: props.task,
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4'}
        onSubmit={form.handleSubmit(props.onSubmit)}
      >
        <FormField
          render={(item) => {
            return (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'tasks:taskTitle'} />
                </FormLabel>

                <FormControl>
                  <Input required {...item.field} />
                </FormControl>

                <FormDescription>
                  <Trans i18nKey={'tasks:taskTitleDescription'} />
                </FormDescription>

                <FormMessage />
              </FormItem>
            );
          }}
          name={'title'}
        />

        <FormField
          render={(item) => {
            return (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'tasks:taskDescription'} />
                </FormLabel>

                <FormControl>
                  <Textarea {...item.field} />
                </FormControl>

                <FormDescription>
                  <Trans i18nKey={'tasks:taskDescriptionDescription'} />
                </FormDescription>

                <FormMessage />
              </FormItem>
            );
          }}
          name={'description'}
        />

        <props.SubmitButton />
      </form>
    </Form>
  );
}
