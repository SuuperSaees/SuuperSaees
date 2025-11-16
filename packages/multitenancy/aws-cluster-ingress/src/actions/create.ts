import { getDomainByUserId } from '../../../utils/get/get-domain';


export async function createIngress({
  domain,
  isCustom,
  userId,
}: {
  domain: string;
  isCustom: boolean;
  userId: string;
}): Promise<any> {
  const { domain: BASE_URL } = await getDomainByUserId(userId, true);
  const SUUPER_CLIENT_ID = process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID;
  const SUUPER_CLIENT_SECRET = process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET;
  const newDomainCreate = {
    domain: `${domain}`,
    namespace: 'prod',
    service_name: 'ms-suuper-prod',
    isCustom,
  };
  const response = await fetch(`${BASE_URL}/api/v1/multitenancy/subdomains`, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Basic ${btoa(`${SUUPER_CLIENT_ID}:${SUUPER_CLIENT_SECRET}`)}`,
    }),
    body: JSON.stringify(newDomainCreate),
  });
  if (!response.ok) {
    throw new Error('Failed to create ingress');
  }
  const data = await response.clone().json();
  return data;
}