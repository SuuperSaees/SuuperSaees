import { enhanceRouteHandler } from '@kit/next/routes';
import { getWebhookHandlerService } from '@kit/webhooks';

export const POST = enhanceRouteHandler(
  async ({ request }) => {
    const service = getWebhookHandlerService();

    try {
      // handle the webhook event
      await service.handleWebhook(request);

      // return a successful response
      return new Response(null, { status: 200 });
    } catch (error) {
      // return an error response
      return new Response(null, { status: 500 });
    }
  },
  {
    auth: false,
  },
);
