/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NextApiRequest, NextApiResponse } from 'next';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { deleteIngress } from '~/multitenancy/aws-cluster-ingress/src';

export const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  // Step 1: Obtain subdomain id from request params
  const subdomainId = req.query.subdomainId;
  if (!subdomainId) {
    const errorResponse = {
      code: 400,
      message: 'Subdomain id is required ',
      error: 'Bad Request',
      details: ['Subdomain id is required'],
    };

    return res.status(400).json(errorResponse);
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
    await deleteIngress({ domain: subdomainId as string });

    return res.status(200);
  } catch (error) {
    const errorResponse = {
      code: 500,
      message: 'Error deleting subdomain',
      error: 'Internal Server Error',
      details: [(error as Error).message],
    };

    return res.status(500).json(errorResponse);
  }
};