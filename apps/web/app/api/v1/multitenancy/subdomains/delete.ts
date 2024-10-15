/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { deleteIngress } from '~/multitenancy/aws-cluster-ingress/src';

export async function deleteIngressAndSubdomain(req: NextRequest) {
  // Step 1: Obtain subdomain id from request params
  const subdomainId = req.nextUrl.searchParams.get('subdomainId') as string;
  if (!subdomainId) {
    const errorResponse = {
      code: 400,
      message: 'Subdomain id is required ',
      error: 'Bad Request',
      details: ['Subdomain id is required'],
    };

    return NextResponse.json(errorResponse, { status: 400 });
  }
  const client = getSupabaseServerComponentClient();
  try {
    // Step 2: Delete the subdomain from the database
    const { error: deleteSubdomainError } = await client
      .from('subdomains')
      .update({
        deleted_on: new Date().toISOString(),
      })
      .eq('id', subdomainId);

    if (deleteSubdomainError) {
      throw new Error(
        `Error deleting subdomain: ${deleteSubdomainError.message}`,
      );
    }

    // Step 3: Delete the subdomain from the provider cluster
    await deleteIngress({ domain: subdomainId });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    const errorResponse = {
      code: 500,
      message: 'Error deleting subdomain',
      error: 'Internal Server Error',
      details: [(error as Error).message],
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
};