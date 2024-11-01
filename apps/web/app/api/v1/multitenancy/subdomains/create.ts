import { NextRequest, NextResponse } from 'next/server';

import { Subdomain } from 'lib/subdomain.types';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { createIngress } from '~/multitenancy/aws-cluster-ingress/src';

export async function createIngressAndSubdomain(req: NextRequest) {
  // Step 1: Obtain and validate the subdomain data from the request body
  const subdomainDataBody = (await req.json()) as Subdomain.Api.Create;
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

    // Function to check if a subdomain already exists
    const checkSubdomainExists = async (
      domainToCheck: string,
      isCustom: boolean,
    ) => {
      const { data } = await client
        .from('subdomains')
        .select('id')
        .eq('domain', isCustom ? domainToCheck : `${domainToCheck}.suuper.co`)
        .single();
      return !!data;
    };

    // Function to generate a unique domain name
    const generateUniqueDomain = async (
      baseDomain: string,
      isCustom: boolean,
    ) => {
      let newDomain = baseDomain;
      let suffix = 1;
      while (await checkSubdomainExists(newDomain, isCustom)) {
        newDomain = `${baseDomain}-${suffix}`;
        suffix++;
      }
      return newDomain;
    };

    // Generate a unique domain name
    domain = await generateUniqueDomain(
      domain,
      subdomainDataBody.isCustom ?? false,
    );

    // Step 2: Create ingress or use provided data based on isCustom flag
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

    const { error: insertError } = await client
      .from('subdomains')
      .insert(newSubdomainData);

    if (insertError) {
      throw new Error(`Error creating subdomain: ${insertError.message}`);
    }

    // Step 4: Return the created subdomain
    const { data: subdomainFetchData, error: subdomainFetchError } =
      await client
        .from('subdomains')
        .select('*')
        .eq(
          'domain',
          subdomainDataBody.isCustom
            ? ingress.domain
            : `${ingress.domain}.suuper.co`,
        )
        .single();

    if (subdomainFetchError) {
      throw new Error(
        `Error getting subdomain: ${subdomainFetchError.message}`,
      );
    }

    return NextResponse.json(subdomainFetchData, { status: 201 });
  } catch (error) {
    // Error handling
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
