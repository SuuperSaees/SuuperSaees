alter table "public"."subdomains" alter column "provider_id" set default gen_random_uuid();

CREATE UNIQUE INDEX subdomains_domain_key ON public.subdomains USING btree (domain);

alter table "public"."subdomains" add constraint "subdomains_domain_key" UNIQUE using index "subdomains_domain_key";

CREATE OR REPLACE FUNCTION public.insert_organization_subdomain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_organization_id uuid;
BEGIN
    SELECT organization_id INTO v_organization_id
    FROM public.accounts
    WHERE id = auth.uid();

    INSERT INTO public.organization_subdomains (organization_id, subdomain_id)
    VALUES (v_organization_id, NEW.id);

    RETURN NEW;
END;
$function$
;

CREATE TRIGGER after_insert_subdomain AFTER INSERT ON public.subdomains FOR EACH ROW EXECUTE FUNCTION insert_organization_subdomain();

GRANT EXECUTE ON FUNCTION public.insert_organization_subdomain() TO authenticated;