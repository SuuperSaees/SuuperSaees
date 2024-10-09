import { NextApiRequest, NextApiResponse } from 'next';



import { Subdomain } from 'lib/subdomain.types';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { createIngress } from '~/multitenancy/aws-cluster-ingress/src';

export const createSubdomain = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  // Step 1: Obtain the subdomain from the request body.
  const subdomainDataBody = req.body as Subdomain.Api.Create;
  // Validate the request body.
  if (
    !subdomainDataBody.namespace ||
    !subdomainDataBody.domain ||
    !subdomainDataBody.service_name
  ) {
    const errorResponse = {
      code: 400,
      message: 'Invalid request body',
      error: 'Bad Request',
      details: ['Namespace, domain, and service name are required'],
    };

    return res.status(400).json(errorResponse);
  }
  const client = getSupabaseServerComponentClient();
  try {
    // Step 2: Upsert the subdomain in the Kubernetes cluster.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const ingress = await createIngress({
      domain: subdomainDataBody.domain,
      namespace: subdomainDataBody.namespace,
      service_name: subdomainDataBody.service_name
    });

    // Step 3: Upsert the subdomain in the database.
    const { data: subdomainData, error: subdomainError } = await client
      .from('subdomains')
      .select('id')
      .eq('domain', subdomainDataBody.isCustom ? ingress.domain : `${ingress.domain}.suuper.co`)
      .single();

    if (subdomainError) {
      throw new Error(`Error getting subdomain: ${subdomainError.message}`);
    }

    if (!subdomainData.id) {
      // Create the subdomain in the database.
      const newSubdomainData: Subdomain.Insert = {
        namespace: ingress.namespace,
        provider: 'c4c7us',
        provider_id: ingress.id,
        domain: subdomainDataBody.isCustom ? ingress.domain : `${ingress.domain}.suuper.co`,
        service_name: ingress.service_name,
        status: ingress.status,
      };
      const { error: newSubdomainError } = await client
        .from('subdomains')
        .insert(newSubdomainData);

      if (newSubdomainError) {
        throw new Error(
          `Error creating subdomain: ${newSubdomainError.message}`,
        );
      }
    } else {
      // Update the subdomain in the database.
      const updateSubdomainData: Subdomain.Update = {
        namespace: ingress.namespace,
        provider: 'c4c7us',
        provider_id: ingress.id,
        service_name: ingress.service_name,
        status: ingress.status,
        domain: subdomainDataBody.isCustom ? ingress.domain : `${ingress.domain}.suuper.co`,
        deleted_on: null,
      };
      const { error: updateSubdomainError } = await client
        .from('subdomains')
        .update(updateSubdomainData)
        .eq('id', subdomainData.id);

      if (updateSubdomainError) {
        throw new Error(
          `Error updating subdomain: ${updateSubdomainError.message}`,
        );
      }
    }

    // Step 4: Update the DNS.
    // WORK IN PROGRESS

    // Step 5: Create row in organization_subdomains table.
    // WORK IN PROGRESS

    // Step 6: Return the subdomain from the database.
    const { data: subdomainFetchData, error: subdomainFetchError } =
      await client
        .from('subdomains')
        .select('*')
        .eq('provider_id', ingress.id)
        .single();

    if (subdomainFetchError) {
      throw new Error(
        `Error getting subdomain: ${subdomainFetchError.message}`,
      );
    }

    return res.status(201).json(subdomainFetchData);
  } catch (error) {
    const errorResponse = {
      code: 500,
      message: 'Error creating subdomain',
      error: 'Internal Server Error',
      details: [(error as Error).message],
    };

    return res.status(500).json(errorResponse);
  }
};