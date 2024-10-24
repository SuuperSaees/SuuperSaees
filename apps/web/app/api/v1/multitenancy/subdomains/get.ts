/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getIngress } from '~/multitenancy/aws-cluster-ingress/src';

export async function getIngressAndSubdomain(req: NextRequest) {
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
    // Step 2: Search for the subdomain in the database
    const { data: subdomainData, error: subdomainError } = await client
      .from('subdomains')
      .select('domain, namespace, provider, provider_id, service_name, status')
      .eq('id', subdomainId)
      .single();
    if (subdomainError) {
      throw new Error(`Error getting subdomain: ${subdomainError.message}`);
    }
    // Step 3: Search for the subdomain in the correct provider cluster
    const subdomainInProvider = await getIngress(subdomainData.domain);
    // Step 4: Compare the subdomain found in the database with the subdomain found in the provider cluster, if they are different, update the subdomain in the database
    const updatedSubdomainData = {
      ...subdomainData,
      status: subdomainInProvider.status,
    };
    if (subdomainInProvider.status !== subdomainData.status) {
      // Step 5: Update the subdomain in the database
      const { error: updateSubdomainError } = await client
        .from('subdomains')
        .update(updatedSubdomainData)
        .eq('id', subdomainId);
      if (updateSubdomainError) {
        throw new Error(
          `Error updating subdomain: ${updateSubdomainError.message}`,
        );
      }
    }
    // Step 6: Return the subdomain found in the database
    return NextResponse.json(updatedSubdomainData, { status: 200 });
  } catch (error) {
    const errorResponse = {
      code: 500,
      message: 'Error getting subdomain',
      error: 'Internal Server Error',
      details: [(error as Error).message],
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
};