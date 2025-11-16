export type SubdomainResponse = {
  id: string;
  status: string;
  domain: string;
  namespace: string;
  service_name: string;
  status_index: string;
  created_at: string;
  updated_at: string;
};

export type SubdomainRequest = {
  domain: string;
  namespace: string;
  service_name: string;
};

export type SubdomainDeleteRequest = {
  domain: string;
};
