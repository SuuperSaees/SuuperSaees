import { useMutation } from '@tanstack/react-query';



import { getUserAccountByEmail } from '../../../features/team-accounts/src/server/actions/members/get/get-member-account';
import { CustomError, ErrorUserOperations } from '../../../shared/src/response';
import { HttpStatus } from '../../../shared/src/response/http-status';
import { useSupabase } from './use-supabase';

interface Params {
  email: string;
  redirectTo: string;
}

/**
 * @name useRequestResetPassword
 * @description Requests a password reset for a user. This function will
 * trigger a password reset email to be sent to the user's email address.
 * After the user clicks the link in the email, they will be redirected to
 * /password-reset where their password can be updated.
 */
export function useRequestResetPassword() {
  const client = useSupabase();
  const mutationKey = ['auth', 'reset-password'];

  const mutationFn = async (params: Params) => {
    // step 1: validate if the email is in the database
    const userData = await getUserAccountByEmail(
      params.email,
      undefined,
      true,
    ).catch(() => {
      console.error('Error getting user data');
    });

    if (!userData) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `user Not Found`,
        ErrorUserOperations.USER_NOT_FOUND,
      );
    }

    // step 2: Generate a token from supabase and save it in the database

    // step 3: Send an email with the token to the user

    const { error, data } = await client.auth.resetPasswordForEmail(
      params.email,
      {
        redirectTo: params.redirectTo,
      },
    );

    if (error) {
      throw error;
    }

    return data;
  };

  return useMutation({
    mutationFn,
    mutationKey,
  });
}