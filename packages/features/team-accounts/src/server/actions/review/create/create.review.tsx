'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Review } from '../../../../../../../../apps/web/lib/review.types';
import { sendOrderCompleted } from '../../orders/send-mail/send-order-completed';
import { getOrderInfo, getEmails  } from '../../orders/get/get-mail-info';
import { getUserById, getOrganizationName } from '../../members/get/get-member-account';

// omit user_id from review
type CreateReviewProps = Omit<Review.Insert, 'user_id'>;
export const createReview = async (review: CreateReviewProps) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError, data: userData } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { error: reviewError, data: reviewData } = await client
      .from('reviews')
      .insert({ ...review, user_id: userData.user.id })
      .select()
      .single();
    if (reviewError) throw reviewError.message;

    // console.log('addedReview:', reviewData);
    // mark the order as completed
    await client
      .from('orders_v2')
      .update({ status: 'completed' })
      .eq('id', review.order_id);

    const userInfo = await getUserById(userData.user.id);
    const orderInfo = await getOrderInfo(review.order_id.toString());
    const agencyName = await getOrganizationName();
    const emailsData = await getEmails(review.order_id.toString());

    for (const email of emailsData) {
      if (email) {
        await sendOrderCompleted(
          email,
          userInfo?.name ?? '',
          review.order_id.toString(),
          orderInfo?.title ?? '',
          agencyName ?? '',
        );
      } else {
        console.warn('Email is null or undefined, skipping...');
      }
    }

    revalidatePath(`/orders/${reviewData.order_id}`);
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};
