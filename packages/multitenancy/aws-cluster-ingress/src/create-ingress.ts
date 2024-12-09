import { SubdomainRequest, SubdomainResponse } from './types/subdomain.type';

export const createIngress = async (
  data: SubdomainRequest,
): Promise<SubdomainResponse> => {
  const AWS_CLUSTER_INGRESS_URL = process.env.AWS_CLUSTER_INGRESS_URL;
  if (!AWS_CLUSTER_INGRESS_URL) {
    throw new Error('AWS_CLUSTER_INGRESS_URL is not defined');
  }
  try {
    const response = await fetch(`${AWS_CLUSTER_INGRESS_URL}/api/ingress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Error creating ingress');
    }
    return response.clone().json() as Promise<SubdomainResponse>;
  } catch (error) {
    console.error(`Error creating ingress: ${error}`);
    throw new Error(`Error creating ingress: ${error}`);
  }
};
