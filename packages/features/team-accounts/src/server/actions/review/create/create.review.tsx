'use server';

import { revalidatePath } from 'next/cache';

import {
  CustomError,
  CustomResponse,
  ErrorOrderOperations,
  ErrorReviewOperations,
  ErrorUserOperations,
} from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Review } from '../../../../../../../../apps/web/lib/review.types';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { getUserById } from '../../members/get/get-member-account';
import { getEmails, getOrderInfo } from '../../orders/get/get-mail-info';
import { sendOrderCompleted } from '../../orders/send-mail/send-order-completed';
import { getOrganization } from '../../organizations/get/get-organizations';

// omit user_id from review
type CreateReviewProps = Omit<Review.Insert, 'user_id'> & { status_id: number };
export const createReview = async (review: CreateReviewProps) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Retrieve the current user
    const { error: userError, data: userData } = await client.auth.getUser();
    if (userError)
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Failed to retrieve user: ${userError.message}`,
        ErrorUserOperations.USER_NOT_FOUND,
      );

    // Check if a review already exists for the order
    const { error: reviewExistsError, data: existingReview } = await client
      .from('reviews')
      .select('id')
      .eq('order_id', review.order_id)
      .single();

    if (reviewExistsError && reviewExistsError.code !== 'PGRST116') {
      // 'PGRST116' indicates no rows were found; any other error should be thrown
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Failed to retrieve review: ${reviewExistsError.message}`,
        ErrorReviewOperations.FAILED_TO_GET_REVIEW,
      );
    }

    if (existingReview) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `A review already exists for order ID ${review.order_id}.`,
        ErrorReviewOperations.REVIEW_ALREADY_EXISTS,
      );
    }

    // Insert the new review
    const { status_id: _status_id, ...reviewToInsert } = review;
    const { error: reviewError, data: reviewData } = await client
      .from('reviews')
      .insert({ ...reviewToInsert, user_id: userData.user.id })
      .select()
      .single();
    if (reviewError)
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Failed to create review: ${reviewError.message}`,
        ErrorReviewOperations.FAILED_TO_CREATE_REVIEW,
      );

    // Mark the order as completed
    const { error: orderError } = await client
      .from('orders_v2')
      .update({ status: 'completed', status_id: _status_id })
      .eq('id', review.order_id);
    if (orderError)
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Failed to update order status: ${orderError.message}`,
        ErrorOrderOperations.FAILED_TO_UPDATE_ORDER_STATUS,
      );

    // Fetch supporting data for notifications
    const userInfo = await getUserById(userData.user.id);
    const orderInfo = await getOrderInfo(review.order_id.toString());
    const agency = await getOrganization();
    const agencyName = agency?.name;
    const emailsData = await getEmails(review.order_id.toString(), [], userData.user.id);

    // Send order completion notifications
    for (const email of emailsData) {
      if (email) {
        await sendOrderCompleted(
          email,
          userInfo?.name ?? '',
          review.order_id.toString(),
          orderInfo?.title ?? '',
          agencyName ?? '',
          userData.user.id,
        );
      } else {
        console.warn('Email is null or undefined, skipping...');
      }
    }

    // Revalidate the page
    revalidatePath(`/orders/${reviewData.order_id}`);
    return CustomResponse.success(reviewData, 'reviewCreated').toJSON();
  } catch (error) {
    console.error('Error creating review:', error);
    return CustomResponse.error(error).toJSON();
  }
};
