import { getDatabaseWebhookHandlerService } from '@kit/database-webhooks';

/**
 * @name POST
 * @description POST handler for the webhook route that handles the webhook event
 */
export async function POST(request: Request) {
  const service = getDatabaseWebhookHandlerService();

  try {
    // handle the webhook event
    await service.handleWebhook(request);

    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
