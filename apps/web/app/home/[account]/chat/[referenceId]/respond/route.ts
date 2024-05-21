import { StreamingTextResponse } from 'ai';

import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import {
  StreamResponseSchema,
  createChatLLMService,
} from '../../_lib/server/chat-llm.service';

export const dynamic = 'force-dynamic';

const FAKE_STREAMER = false;

export const POST = enhanceRouteHandler(
  async ({ body, params }) => {
    if (FAKE_STREAMER) {
      return new StreamingTextResponse(fakeDataStreamer());
    }

    const client = getSupabaseRouteHandlerClient();

    const adminClient = getSupabaseRouteHandlerClient({
      admin: true,
    });

    const service = createChatLLMService(client, adminClient);
    const referenceId = params.referenceId as string;

    try {
      return await service.streamResponse(body, referenceId);
    } catch (error) {
      console.error(error);

      const message = error instanceof Error ? error.message : 'Unknown error';

      return new Response(message, { status: 500 });
    }
  },
  {
    schema: StreamResponseSchema,
  },
);

function fakeDataStreamer() {
  let timerId: number | undefined;
  const encoder = new TextEncoder();
  let closed = false;

  return new ReadableStream({
    start(controller) {
      // @ts-ignore
      timerId = setInterval(() => {
        if (closed) return;

        controller.enqueue(encoder.encode('TEXT'));
      }, 200);

      setTimeout(() => {
        controller.close();
        closed = true;
      }, 5_000);
    },
    cancel() {
      if (typeof timerId === 'number') {
        clearInterval(timerId);
      }
    },
  });
}
