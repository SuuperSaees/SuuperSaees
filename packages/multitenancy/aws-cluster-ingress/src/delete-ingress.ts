import { SubdomainDeleteRequest } from './types/subdomain.type';

export const deleteIngress = async (
  data: SubdomainDeleteRequest,
): Promise<void> => {
  const AWS_CLUSTER_INGRESS_URL = process.env.AWS_CLUSTER_INGRESS_URL;
  if (!AWS_CLUSTER_INGRESS_URL) {
    throw new Error('AWS_CLUSTER_INGRESS_URL is not defined');
  }
  try {
    const response = await fetch(`${AWS_CLUSTER_INGRESS_URL}/api/ingress`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Error deleting ingress');
    }
    return;
  } catch (error) {
    console.error(`Error deleting ingress: ${error}`);
    throw new Error(`Error deleting ingress: ${error}`);
  }
};
