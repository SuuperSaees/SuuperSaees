import { NextRequest } from 'next/server';



import { ErrorBillingOperations } from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { ApiError } from '~/lib/api/api-error';
import { BaseController } from '~/lib/api/base-controller';
import { BillingAccount as BillingAccountApi } from '~/lib/api/billing-accounts.types';
import { BillingAccounts } from '~/lib/billing-accounts.types';



import { createAccountService } from '../services/account.service';


export class AccountController extends BaseController {
  // CREATE
  async create(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID(); // Implement requestId in BaseController in the future

    try {
      const body = await this.parseBody<BillingAccountApi>(req);
      body.accountId = this.getAccountId(req);

      if (body.provider === BillingAccounts.BillingProviderKeys.STRIPE) {
        throw ApiError.notFound(
          'Stripe account not found',
          ErrorBillingOperations.FAILED_TO_CREATE_STRIPE_ACCOUNT,
        );
      }

      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const accountService = await createAccountService(client);
      const account = await accountService.createAccount(body);
      return this.created(account, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  // LIST
  async list(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID(); // Implement requestId in BaseController in the future
    const accountId = this.getAccountId(req);
    try {
      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const accountService = await createAccountService(client);
      const accounts = await accountService.listByAccountId(accountId);
      return this.ok(accounts, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  // DELETE
  async delete(
    _: undefined,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID(); // Implement requestId in BaseController in the future
    const billingAccountId = params.id;
    try {
      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const accountService = await createAccountService(client);
      await accountService.deleteAccount(billingAccountId);
      return this.ok({}, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  // UPDATE
  async update(
    req: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID(); // Implement requestId in BaseController in the future
    const body = await this.parseBody<BillingAccountApi>(req);
    const billingAccountId = params.id;
    try {
      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const accountService = await createAccountService(client);
      const account = await accountService.updateAccount(
        billingAccountId,
        body,
      );
      return this.ok(account, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  // GET
  async get(
    _: undefined,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID(); // Implement requestId in BaseController in the future
    const billingAccountId = params.id;
    try {
      const client = getSupabaseServerComponentClient({
        admin: true,
      });
      const accountService = await createAccountService(client);
      const account = await accountService.findById(billingAccountId);
      return this.ok(account, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  // PRIVATE METHODS
  private getAccountId(req: NextRequest): string {
    const accountId = req.nextUrl.searchParams.get('accountId');
    if (!accountId) {
      throw ApiError.badRequest('Account ID is required');
    }
    return accountId;
  }

  private getBillingAccountId(req: NextRequest): string {
    const billingAccountId = req.nextUrl.searchParams.get('billingAccountId');
    if (!billingAccountId) {
      throw ApiError.badRequest('Billing account ID is required');
    }
    return billingAccountId;
  }
}