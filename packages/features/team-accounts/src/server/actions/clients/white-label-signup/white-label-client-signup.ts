'use server';

import { redirect } from 'next/navigation';

import { createClient } from '../create/create-clients';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { WhiteLabelClientSignUpSchema, type WhiteLabelClientSignUpData } from '../../../../../../auth/src/schemas/white-label-client-sign-up.schema';
import { sendEmail } from '../../../../../../../../apps/web/app/server/services/send-email.service';
import { EMAIL } from '../../../../../../../../apps/web/app/server/services/email.types';
import { getAgencyOwner } from '../../members/get/get-member-account';

export async function whiteLabelClientSignUp(data: WhiteLabelClientSignUpData, host: string, agencyId: string, agencyName: string) {
  try {
    // Validate the input data
    const validatedData = WhiteLabelClientSignUpSchema.parse(data);

    const baseUrl = `${host === 'localhost:3000' ? 'http://' : 'https://'}${host}`;

    // Create the client using the existing createClient function
    const result = await createClient({
      client: {
        name: validatedData.name,
        email: validatedData.email,
        slug: validatedData.organizationName.toLowerCase().replace(/\s+/g, '-'),
      },
      role: 'client_owner',
      agencyId: agencyId,
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

    // Send notification email to agency owner
    try {
      const agencyOwner = await getAgencyOwner(agencyId);
      
      if (agencyOwner && result.success?.data) {
        const registrationDate = new Date().toLocaleDateString();
        
        await sendEmail(EMAIL.CLIENTS.NEW_REGISTRATION, {
          to: agencyOwner.email ?? '',
          userId: agencyOwner?.owner_id,
          clientName: validatedData.name,
          clientEmail: validatedData.email,
          organizationName: validatedData.organizationName,
          registrationDate: registrationDate,
          agencyId,
          domain: baseUrl,
          buttonUrl: `${baseUrl}/clients`,
          agencyName,
        });
        
      } else {
        console.warn('Could not find agency owner email or client data for notification');
      }
    } catch (emailError) {
      // Log email error but don't fail the registration
      console.error('Failed to send notification email to agency owner:', emailError);
    }

    // Automatically sign in the user
    const supabase = getSupabaseServerComponentClient({ admin: true });

    await supabase.rpc('update_user_credentials', {
      p_domain: host,
      p_email: validatedData.email,
      p_password: '',
    });


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
