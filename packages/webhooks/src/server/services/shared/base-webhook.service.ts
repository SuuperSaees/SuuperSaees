import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { ActivityService } from './activity.service';

export abstract class BaseWebhookService {
  protected readonly activityService: ActivityService;

  constructor(protected readonly adminClient: SupabaseClient<Database>, protected readonly baseUrl: string) {
    this.activityService = new ActivityService(adminClient);
  }

  protected mapStripeInvoiceStatus(stripeStatus: string): 'draft' | 'issued' | 'paid' | 'overdue' | 'voided' {
    const statusMap: Record<string, 'draft' | 'issued' | 'paid' | 'overdue' | 'voided'> = {
      'draft': 'draft',
      'open': 'issued',
      'paid': 'paid',
      'uncollectible': 'overdue',
      'void': 'voided',
    };

    return statusMap[stripeStatus] ?? 'draft';
  }
}