# API Webhooks - @kit/api-webhooks

This package is responsible for handling webhooks from various API events.

For example:
1. When a new resource is created, we trigger a notification to the relevant services.
2. When a resource is updated, we synchronize the changes across all dependent systems.
3. When a resource is deleted, we ensure all related data is cleaned up in third-party services.

The default sender provider is directly from the Postgres database.

```
WEBHOOK_SENDER_PROVIDER=postgres
```

Should you add a middleware to the webhook sender provider, you can do so by adding the following to the `WEBHOOK_SENDER_PROVIDER` environment variable.

```
WEBHOOK_SENDER_PROVIDER=svix
```

For example, you can add [Svix](https://docs.svix.com/quickstart) as a webhook sender provider that receives webhooks from API events and forwards them to your application.

Svix is not implemented yet.