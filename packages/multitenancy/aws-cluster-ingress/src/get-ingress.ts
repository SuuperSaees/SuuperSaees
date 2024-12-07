import { SubdomainResponse } from './types/subdomain.type';

export const getIngress = async (
  domain: string,
): Promise<SubdomainResponse> => {
  const AWS_CLUSTER_INGRESS_URL = process.env.AWS_CLUSTER_INGRESS_URL;
  if (!AWS_CLUSTER_INGRESS_URL) {
    throw new Error('AWS_CLUSTER_INGRESS_URL is not defined');
  }

  try {
    const response = await fetch(
      `${AWS_CLUSTER_INGRESS_URL}/api/ingress?domain=${domain}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      throw new Error('Error getting ingress');
    }
    return response.clone().json() as Promise<SubdomainResponse>;
  } catch (error) {
    console.error(`Error getting ingress: ${error}`);
    throw new Error(`Error getting ingress: ${error}`);
  }
};
