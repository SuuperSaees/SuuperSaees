import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { ChatSettingsSchema } from '../_lib/schema/chat-settings.schema';
import { updateChatSettingsAction } from '../_lib/server/server-actions';

export function ChatSettingsDialog(
  props: React.PropsWithChildren<{
    chatReferenceId: string;
  }>,
) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="chats:chatSettings" />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey="chats:chatSettingsDescription" />
          </DialogDescription>
        </DialogHeader>

        <ChatSettingsDataProvider chatReferenceId={props.chatReferenceId}>
          {(data) => {
            return (
              <ChatSettingsForm
                chatReferenceId={props.chatReferenceId}
                settings={data}
                onSave={() => setOpen(false)}
              />
            );
          }}
        </ChatSettingsDataProvider>
      </DialogContent>
    </Dialog>
  );
}

function ChatSettingsDataProvider(props: {
  children: (
    data: Partial<z.infer<typeof ChatSettingsSchema>>,
  ) => React.ReactNode;
  chatReferenceId: string;
}) {
  const { data, isError, isLoading } = useChatSettings(props.chatReferenceId);

  if (isLoading) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (isError) {
    return (
      <Alert variant={'destructive'}>
        <AlertTitle>
          <Trans i18nKey="chats:loadSettingsError" />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey="chats:loadSettingsErrorDescription" />
        </AlertDescription>
      </Alert>
    );
  }

  return props.children(data ?? {});
}

function ChatSettingsForm({
  settings,
  chatReferenceId,
  onSave,
}: {
  settings: Partial<z.infer<typeof ChatSettingsSchema>>;
  onSave: () => void;
  chatReferenceId: string;
}) {
  const form = useForm({
    resolver: zodResolver(ChatSettingsSchema),
    defaultValues: {
      model: settings.model ?? 'gpt-3.5-turbo',
      temperature: settings.temperature ?? 0.7,
      systemMessage: settings.systemMessage ?? 'You are a helpful assistant',
      maxTokens: settings.maxTokens ?? 100,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col space-y-4"
        onSubmit={form.handleSubmit(async (settings) => {
          await updateChatSettingsAction({
            referenceId: chatReferenceId,
            settings,
          });

          onSave();
        })}
      >
        <FormField
          name="model"
          render={() => {
            return (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="chats:model" />
                </FormLabel>

                <FormControl>
                  <Select
                    value={form.watch('model')}
                    onValueChange={(value) =>
                      form.setValue(
                        'model',
                        value as z.infer<typeof ChatSettingsSchema>['model'],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo (cheap)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormDescription>
                  <Trans i18nKey={'chats:modelDemoAlert'} />
                </FormDescription>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          name="systemMessage"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="chats:systemMessage" />
                </FormLabel>

                <FormControl>
                  <Textarea maxLength={3000} {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex justify-end">
          <Button>
            <Trans i18nKey="chats:save" />
          </Button>
        </div>
      </form>
    </Form>
  );
}

function useChatSettings(chatReferenceId: string) {
  const supabase = useSupabase();
  const queryKey = ['chat-settings', chatReferenceId];

  const queryFn = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('settings')
      .eq('reference_id', chatReferenceId)
      .single();

    if (error) {
      throw error;
    }

    return (data.settings ?? {}) as Partial<z.infer<typeof ChatSettingsSchema>>;
  };

  return useQuery({
    queryKey,
    queryFn,
  });
}
