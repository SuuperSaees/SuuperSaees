/**
 *
 * Very ugly! But okay for the demo. Don't try this at home.
 *
 * This function is used to monkey patch the `fetch` function in the worker environment.
 * It is necessary because the `cache` field is not implemented in the worker environment and will throw an error.
 * TODO: remove once Cloudflare Workers supports the `cache` field.
 *
 * Without this - the CMS will not work in Cloudflare. And I really want the demo to work in Cloudflare.
 *
 * Based on: https://gist.github.com/tjenkinson/53b5724bf8112487f6bd797368e02b56
 * Fixes: https://github.com/cloudflare/workerd/issues/698
 */
function mockWorkerdFetch() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function (...args) {
    try {
      return await originalFetch.apply(this, args);
    } catch (e) {
      if (!args[1] || typeof args[1] !== 'object') throw e;

      const unimplementedCacheError =
        e &&
        typeof e === 'object' &&
        'message' in e &&
        e.message ===
          "The 'cache' field on 'RequestInitializerDict' is not implemented.";
      if (!unimplementedCacheError) throw e;

      const newOpts = { ...args[1] };
      delete newOpts.cache;
      return originalFetch.apply(this, [args[0], newOpts]);
    }
  };
}

mockWorkerdFetch();
