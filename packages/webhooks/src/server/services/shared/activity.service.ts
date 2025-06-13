import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { Activity } from '../../../../../../apps/web/lib/activity.types';

export class ActivityService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  async createActivity({
    action,
    actor,
    message,
    type,
    clientId,
    invoiceId,
    value,
  }: {
    action: 'create' | 'update' | 'delete';
    actor: string;
    message: string;
    type: Activity.Enums.ActivityType;
    value: string;
    clientId?: string;
    invoiceId?: string;
  }) {
    try {
      const activityData: Activity.Insert = {
        action,
        actor,
        message,
        type,
        value,
        user_id: clientId ?? '',
        reference_id: invoiceId ?? null,
        preposition: 'to'
      };

      const { error } = await this.adminClient
        .from('activities')
        .insert(activityData);

      if (error) {
        console.error('Error creating activity:', error);
      }
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  }
}