'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createClient } from '../create/create-clients';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { WhiteLabelClientSignUpSchema, type WhiteLabelClientSignUpData } from '../../../../../../auth/src/schemas/white-label-client-sign-up.schema';

export async function whiteLabelClientSignUp(data: WhiteLabelClientSignUpData) {
  try {
    // Validate the input data
    const validatedData = WhiteLabelClientSignUpSchema.parse(data);

    // Get host for the baseUrl - for server actions we need to get it differently
    const headers = new Headers();
    const host = headers.get('host') ?? process.env.VERCEL_URL ?? 'localhost:3000';
    const baseUrl = `${host === 'localhost:3000' ? 'http://' : 'https://'}${host}`;

    // Create the client using the existing createClient function
    const result = await createClient({
      client: {
        name: validatedData.name,
        email: validatedData.email,
        slug: validatedData.organizationName.toLowerCase().replace(/\s+/g, '-'),
      },
      role: 'client_owner',
      adminActivated: true,
      baseUrl,
      sendEmail: true,
      isSignUp: true,
      customPassword: validatedData.password,
    });

    // Check if the client creation was successful
    if (!result.ok) {
      const errorMessage = result.error?.message ?? 'Failed to create client';
      throw new Error(errorMessage);
    }

    // Automatically sign in the user
    const supabase = getSupabaseServerComponentClient({ admin: false });
    
    // Sign in with the newly created credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      throw new Error('Account created but failed to sign in automatically');
    }

    // Set the session domain context
    const domain = host;
    const { error: setSessionError } = await supabase.rpc('set_session', {
      domain,
    });

    if (setSessionError) {
      console.error('Set session error:', setSessionError);
    }

    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/orders');

  } catch (error) {
    console.error('White label client signup error:', error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Registration failed. Please try again.');
  }

  // Redirect to orders page (this must be outside the try-catch)
  redirect('/orders');
}
