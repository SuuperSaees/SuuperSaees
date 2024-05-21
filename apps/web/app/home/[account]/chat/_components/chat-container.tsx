'use client';

import { useCallback, useEffect, useRef, useTransition } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Message, nanoid } from 'ai';
import { useChat } from 'ai/react';
import {
  Bot,
  CircleStop,
  SendIcon,
  SettingsIcon,
  StepForwardIcon,
  Trash,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useCsrfToken } from '@kit/shared/hooks';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { LoadingBubble } from '~/home/[account]/chat/_components/loading-bubble';
import { createChatAction } from '~/home/[account]/chat/_lib/server/server-actions';

import { ChatSettingsDialog } from './chat-settings-dialog';
import { DeleteChatDialog } from './delete-chat-dialog';

export function ChatContainer(
  props: React.PropsWithChildren<{
    referenceId: string;
    accountId: string;
    messages: Message[];
    content?: string;
  }>,
) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const queryClient = useQueryClient();
  const loadInitialContentRef = useRef(false);
  const { t } = useTranslation('chats');

  const [isCreatingChat, startTransition] = useTransition();

  const onError = (error: unknown) => {
    if (error instanceof Error && error.message === 'No credits available') {
      toast.error(t('noCredits'));
    } else {
      toast.error(t('genericError'));
    }
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    stop,
  } = useChat({
    api: `${props.referenceId}/respond`,
    headers: {
      'X-CSRF-Token': csrfToken,
    },
    body: {
      accountId: props.accountId,
    },
    initialMessages: props.messages,
    onError,
    onFinish: () => {
      void queryClient.invalidateQueries({
        queryKey: ['credits', props.accountId],
      });
    },
  });

  const onContinue = useCallback(() => {
    void append(
      {
        role: 'user',
        content: 'Continue',
      },
      {},
    );
  }, [append]);

  // append the user's message if it exists
  useEffect(() => {
    if (props.content && !loadInitialContentRef.current) {
      loadInitialContentRef.current = true;

      void append(
        {
          role: 'user',
          content: props.content,
        },
        {},
      );

      // clear the query string
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return (
    <div className={'flex flex-1 flex-col items-center'}>
      <ChatSettings
        accountId={props.accountId}
        referenceId={props.referenceId}
      />

      <ChatMessagesContainer
        isLoading={isLoading}
        messages={messages}
        onContinue={onContinue}
      />

      <ChatInput
        loading={isLoading}
        disabled={isCreatingChat}
        handleInputChange={handleInputChange}
        value={input}
        onStop={stop}
        handleSubmit={(event) => {
          event.preventDefault();

          // if we already have a chat ID
          // we can submit the user's message
          if (props.referenceId) {
            return handleSubmit(event);
          } else {
            // otherwise, we create a chat first
            // and navigate to the chat
            startTransition(async () => {
              // assign an ID
              const referenceId = nanoid(8);

              try {
                // create a chat
                await createChatAction({
                  accountId: props.accountId,
                  referenceId,
                  content: input,
                });

                // navigate to the chat
                router.replace(`chat/${referenceId}?content=${input}`);
              } catch (error) {
                onError(error);
              }
            });
          }
        }}
      />
    </div>
  );
}

export function ChatMessagesContainer({
  messages,
  isLoading,
  onContinue,
}: {
  messages: Message[];
  isLoading: boolean;
  onContinue: () => void;
}) {
  const scrollingDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollingDiv.current) {
      scrollingDiv.current.scrollTop = scrollingDiv.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollingDiv}
      className={
        'mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 pb-16 pt-6'
      }
    >
      <If condition={!messages.length && !isLoading}>
        <EmptyState />
      </If>

      <If condition={messages.length}>
        <div className={'flex max-w-full flex-1 flex-col space-y-4'}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                `flex flex-col space-y-2 animate-in fade-in zoom-in-95`,
                {
                  'items-end': message.role === 'user',
                  'items-start': message.role === 'assistant',
                },
              )}
            >
              <div className={'px-2'}>
                <span className={'text-xs font-semibold'}>
                  {message.role === 'assistant' ? 'AI' : 'User'}
                </span>
              </div>

              <div
                className={cn(
                  'flex w-auto flex-col space-y-6 whitespace-pre-line rounded-3xl border border-transparent px-6 py-6 text-sm',
                  {
                    'bg-muted dark:bg-primary dark:text-primary-foreground':
                      message.role === 'user',
                    'border-border': message.role === 'assistant',
                  },
                )}
              >
                <div>{message.content}</div>

                <If
                  condition={
                    message.role === 'assistant' &&
                    index === messages.length - 1
                  }
                >
                  <If condition={!isLoading}>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={onContinue}>
                        <StepForwardIcon className="mr-2 h-4 w-4" />
                        <Trans i18nKey={'chats:continue'} />
                      </Button>
                    </div>
                  </If>
                </If>
              </div>
            </div>
          ))}

          <If condition={isLoading}>
            <LoadingBubble />
          </If>
        </div>
      </If>
    </div>
  );
}

export function ChatInput(props: {
  loading: boolean;
  disabled: boolean;
  onStop: () => void;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useTranslation('chats');

  return (
    <form
      onSubmit={props.handleSubmit}
      className={
        'relative bottom-8 mx-auto mt-auto w-full max-w-3xl shadow-[0px_-58px_80px_4px_#fff] animate-in slide-in-from-bottom-8 dark:shadow-[0px_-58px_80px_4px_#000]'
      }
    >
      <If condition={props.loading}>
        <Button
          className="absolute right-4 top-2 z-[1]"
          variant="outline"
          size="sm"
          onClick={props.onStop}
        >
          <CircleStop className="mr-1 h-4" />
          <span>{t('stopGenerating')}</span>
        </Button>
      </If>

      <Input
        disabled={props.disabled || props.loading}
        value={props.value}
        onChange={props.handleInputChange}
        placeholder={t('askAiPlaceholder')}
        className={
          'w-full rounded-3xl bg-background px-4 py-6 pl-12 pr-12 transition-all focus-visible:shadow-xl'
        }
      />

      <Bot className="absolute left-4 top-3.5 h-5 text-muted-foreground" />

      <If condition={!props.loading}>
        <Button
          disabled={props.disabled}
          variant={'ghost'}
          size={'icon'}
          className={'absolute right-4 top-1.5 rounded-full'}
        >
          <SendIcon className={'h-5 text-muted-foreground'} />
        </Button>
      </If>
    </form>
  );
}

function ChatSettings(props: { referenceId: string; accountId: string }) {
  return (
    <div
      className={
        'z-[1] flex w-full items-center justify-between border-b px-4 py-2 shadow-[0px_-20px_180px_30px_#fff] animate-in slide-in-from-top-8 dark:shadow-[0px_-20px_180px_30px_#000]'
      }
    >
      <div>
        <TokensBadge accountId={props.accountId} />
      </div>

      <div className={'flex justify-end space-x-2'}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <ChatSettingsDialog chatReferenceId={props.referenceId}>
              <TooltipTrigger asChild>
                <Button
                  disabled={!props.referenceId}
                  size={'icon'}
                  variant={'ghost'}
                >
                  <SettingsIcon className={'h-4'} />
                </Button>
              </TooltipTrigger>
            </ChatSettingsDialog>

            <TooltipContent>
              <Trans i18nKey={'chats:chatSettings'} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <DeleteChatDialog chatReferenceId={props.referenceId}>
              <TooltipTrigger asChild>
                <Button
                  disabled={!props.referenceId}
                  size={'icon'}
                  variant={'ghost'}
                >
                  <Trash className={'h-4'} />
                </Button>
              </TooltipTrigger>
            </DeleteChatDialog>

            <TooltipContent>
              <Trans i18nKey={'chats:deleteChat'} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className={
        'flex h-full flex-1 flex-col justify-center space-y-8 py-8 text-center text-sm text-muted-foreground animate-in fade-in zoom-in'
      }
    >
      <div className={'flex justify-center'}>
        <Image
          alt={'ChatGPT logo'}
          src={'/images/chatgpt-logo.svg'}
          width={120}
          height={120}
        />
      </div>

      <div>
        <Trans i18nKey={'chats:getStarted'} />
      </div>
    </div>
  );
}

function TokensBadge(props: { accountId: string }) {
  const { data, isLoading } = useFetchTokens(props.accountId);

  if (isLoading) {
    return (
      <Badge variant={'outline'}>
        <Trans i18nKey={'chats:loadingTokens'} />
      </Badge>
    );
  }

  return (
    <Badge variant={'outline'} className="flex space-x-1">
      <span className="animate-in slide-in-from-bottom-4" key={data}>
        {data}
      </span>

      <span>
        <Trans i18nKey={'chats:remainingTokens'} />
      </span>
    </Badge>
  );
}

function useFetchTokens(accountId: string) {
  const queryKey = ['credits', accountId];
  const supabase = useSupabase();

  const queryFn = async () => {
    const { data, error } = await supabase
      .from('credits_usage')
      .select('remaining_credits')
      .eq('account_id', accountId)
      .single();

    if (error) {
      throw error;
    }

    return data?.remaining_credits ?? 0;
  };

  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
