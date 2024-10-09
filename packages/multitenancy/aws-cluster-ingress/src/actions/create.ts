export async function createIngress({
  domain,
  isCustom,
}: {
  domain: string;
  isCustom: boolean;
}): Promise<any> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const newDomainCreate = {
    domain: `${domain}.suuper.co`,
    namespace: 'prod',
    service_name: 'ms-suuper-prod',
    isCustom,
  };
  const response = await fetch(`${BASE_URL}/api/v1/multitenancy/subdomains`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newDomainCreate),
  });
  if (!response.ok) {
    throw new Error('Failed to create ingress');
  }
  const data = await response.json();
  return data;
}
