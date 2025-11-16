import { NextRequest, NextResponse } from 'next/server';

import { Subdomain } from 'lib/subdomain.types';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { createIngress } from '~/multitenancy/aws-cluster-ingress/src';

export async function createIngressAndSubdomain(req: NextRequest) {  
  // Step 1: Obtain and validate the subdomain data
  const subdomainDataBody = (await req.clone().json()) as Subdomain.Api.Create;

  if (!subdomainDataBody.namespace || !subdomainDataBody.service_name) {
    return NextResponse.json(
      {
        code: 400,
        message: 'Invalid request body',
        error: 'Bad Request',
        details: ['Namespace, domain, and service name are required'],
      },
      { status: 400 },
    );
  }

  const client = getSupabaseServerComponentClient();

  try {
    let ingress;
    let domain = subdomainDataBody.domain;

    // Log before checking subdomain
    const checkSubdomainExists = async (domainToCheck: string, isCustom: boolean) => {
      const fullDomain = isCustom ? domainToCheck : `${domainToCheck}.suuper.co`;
      const { data } = await client
        .from('subdomains')
        .select('id')
        .eq('domain', fullDomain)
        .single();
      return !!data;
    };

    // Log domain generation
    const generateUniqueDomain = async (baseDomain: string, isCustom: boolean) => {
      let newDomain = baseDomain;
      let suffix = 1;
      while (await checkSubdomainExists(newDomain, isCustom)) {
        newDomain = `${baseDomain}-${suffix}`;
        suffix++;
      }
      return newDomain;
    };

    domain = await generateUniqueDomain(domain, subdomainDataBody.isCustom ?? false);

    if (subdomainDataBody.isCustom) {
      ingress = await createIngress({
        domain,
        namespace: subdomainDataBody.namespace,
        service_name: subdomainDataBody.service_name,
      });
    } else {
      ingress = {
        domain,
        namespace: subdomainDataBody.namespace,
        service_name: subdomainDataBody.service_name,
        status: 'no-custom',
        id: null,
      };
    }

    // Step 3: Create the new subdomain in the database
    const newSubdomainData: Subdomain.Insert = {
      namespace: ingress.namespace,
      provider: 'c4c7us',
      domain: subdomainDataBody.isCustom
        ? ingress.domain
        : `${ingress.domain}.suuper.co`.toLowerCase(),
      service_name: ingress.service_name,
      status: ingress.status,
    };

    const { data: insertSubdomainData, error: insertError } = await client
      .from('subdomains')
      .insert(newSubdomainData)
      .select()
      .single();
      

    if (insertError) {
      console.error('[createIngressAndSubdomain] Insert error:', insertError);
      throw new Error(`Error creating subdomain: ${insertError.message}`);
    }

    const { data: subdomainFetchData, error: subdomainFetchError } = await client
      .from('subdomains')
      .select('*')
      .eq('domain', subdomainDataBody.isCustom ? insertSubdomainData.domain : `${insertSubdomainData.domain}`)
      .single();

    if (subdomainFetchError) {
      console.error('[createIngressAndSubdomain] Fetch error:', subdomainFetchError);
      throw new Error(`Error getting subdomain: ${subdomainFetchError.message}`);
    }

    return NextResponse.json(subdomainFetchData, { status: 201 });
  } catch (error) {
    console.error('[createIngressAndSubdomain] Fatal error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Error creating subdomain',
        error: 'Internal Server Error',
        details: [(error as Error).message],
      },
      { status: 500 },
    );
  }
}
