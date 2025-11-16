'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Activity } from '../../../../../../../../apps/web/lib/activity.types';

export const addActivityAction = async (activity: Activity.Insert) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;
    const { error: activityError } = await client
      .from('activities')
      .insert(activity)
      .select('*')
      .single();
    if (activityError) throw activityError.message;
    revalidatePath(`/orders/${activity.order_id}`);
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};