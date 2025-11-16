import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';

import { UpdateTask } from './_components/update-task';

interface Params {
  task: string;
}

async function TaskPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const taskId = params.task;
  const client = getSupabaseServerComponentClient();

  const { data: task, error } = await client
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) {
    return (
      <Alert>
        <AlertTitle>Error loading task</AlertTitle>

        <AlertDescription>
          Something went wrong while loading the task
        </AlertDescription>
      </Alert>
    );
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <>
      <PageHeader title={task.title}>
        <Link href={'../'}>
          <Button variant={'link'}>
            <ArrowLeft className={'mr-2 h-4'} />

            <span>Go back</span>
          </Button>
        </Link>
      </PageHeader>

      <PageBody>
        <div className={'container mx-auto max-w-2xl'}>
          <UpdateTask task={task} />
        </div>
      </PageBody>
    </>
  );
}

export default TaskPage;
