create type "public"."credit_operation_status" as enum ('consumed', 'purchased', 'refunded', 'locked', 'expired');

create type "public"."credit_operation_type" as enum ('user', 'system');

DO $$
BEGIN
    -- Add 'credits.write' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'credits.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'credits.write';
    END IF;

    -- Add 'credits.read' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'credits.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'credits.read';
    END IF;

    -- Add 'credits.manage' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'credits.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'credits.manage';
    END IF;

    -- Add 'credits.delete' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'credits.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'credits.delete';
    END IF;
END $$;

COMMIT;

INSERT INTO public.role_permissions (role, permission) VALUES 
    ('super_admin', 'credits.write'),
    ('super_admin', 'credits.read'),
    ('super_admin', 'credits.manage'),
    ('super_admin', 'credits.delete'),
    ('agency_owner', 'credits.write'),
    ('agency_owner', 'credits.read'),
    ('agency_owner', 'credits.manage'),
    ('agency_owner', 'credits.delete'),
    ('agency_project_manager', 'credits.write'),
    ('agency_project_manager', 'credits.read'),
    ('agency_project_manager', 'credits.manage'),
    ('agency_project_manager', 'credits.delete'),
    ('agency_member', 'credits.read'),
    ('client_owner', 'credits.read'),
    ('client_member', 'credits.read');

create table "public"."credit_operations" (
    "id" uuid not null default gen_random_uuid(),
    "actor_id" uuid not null,
    "status" credit_operation_status not null default 'consumed'::credit_operation_status,
    "type" credit_operation_type not null default 'user'::credit_operation_type,
    "quantity" bigint not null,
    "description" text,
    "credit_id" uuid not null,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_on" timestamp with time zone
);


alter table "public"."credit_operations" enable row level security;

create table "public"."credits" (
    "id" uuid not null default gen_random_uuid(),
    "agency_id" uuid not null,
    "client_organization_id" uuid not null,
    "balance" bigint not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_on" timestamp with time zone,
    "user_id" uuid
);


alter table "public"."credits" enable row level security;

alter table "public"."orders_v2" add column "credit_operation_id" uuid;

alter table "public"."account_plugins" add column "config" jsonb;

CREATE UNIQUE INDEX credit_operations_pkey ON public.credit_operations USING btree (id);

CREATE UNIQUE INDEX credits_client_organization_id_unique ON public.credits USING btree (client_organization_id);

CREATE UNIQUE INDEX credits_pkey ON public.credits USING btree (id);

CREATE INDEX idx_credit_operations_actor_id ON public.credit_operations USING btree (actor_id);

CREATE INDEX idx_credit_operations_created_at ON public.credit_operations USING btree (created_at);

CREATE INDEX idx_credit_operations_credit_id ON public.credit_operations USING btree (credit_id);

CREATE INDEX idx_credit_operations_deleted_on ON public.credit_operations USING btree (deleted_on);

CREATE INDEX idx_credit_operations_status ON public.credit_operations USING btree (status);

CREATE INDEX idx_credit_operations_type ON public.credit_operations USING btree (type);

CREATE INDEX idx_credits_agency_id ON public.credits USING btree (agency_id);

CREATE INDEX idx_credits_client_organization_id ON public.credits USING btree (client_organization_id);

CREATE INDEX idx_credits_deleted_on ON public.credits USING btree (deleted_on);

CREATE INDEX idx_credits_user_id ON public.credits USING btree (user_id);

alter table "public"."credit_operations" add constraint "credit_operations_pkey" PRIMARY KEY using index "credit_operations_pkey";

alter table "public"."credits" add constraint "credits_pkey" PRIMARY KEY using index "credits_pkey";

alter table "public"."credit_operations" add constraint "credit_operations_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."credit_operations" validate constraint "credit_operations_actor_id_fkey";

alter table "public"."credit_operations" add constraint "credit_operations_credit_id_fkey" FOREIGN KEY (credit_id) REFERENCES credits(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."credit_operations" validate constraint "credit_operations_credit_id_fkey";

alter table "public"."credits" add constraint "credits_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."credits" validate constraint "credits_agency_id_fkey";

alter table "public"."credits" add constraint "credits_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."credits" validate constraint "credits_client_organization_id_fkey";

alter table "public"."credits" add constraint "credits_client_organization_id_unique" UNIQUE using index "credits_client_organization_id_unique";

alter table "public"."credits" add constraint "credits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."credits" validate constraint "credits_user_id_fkey";

alter table "public"."orders_v2" add constraint "orders_v2_credit_operation_id_fkey" FOREIGN KEY (credit_operation_id) REFERENCES credit_operations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_credit_operation_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_client_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    owner_role text;
    membership_type text;
    org_owner_id uuid;
BEGIN
    -- Get the owner_id of the client organization
    SELECT owner_id INTO org_owner_id
    FROM public.organizations
    WHERE id = NEW.organization_client_id
    LIMIT 1;

    -- Get the role of the owner of the client organization
    SELECT am.account_role INTO owner_role
    FROM public.accounts_memberships am
    WHERE am.user_id = org_owner_id 
    AND am.organization_id = NEW.organization_client_id
    LIMIT 1;

    -- If we didn't find a role in accounts_memberships, assume it's client
    IF owner_role IS NULL THEN
        SELECT 'client' INTO membership_type;
    ELSE
        -- Determine if it's client or agency based on the role
        IF owner_role IN ('client_owner', 'client_member') THEN
            membership_type := 'client';
        ELSIF owner_role IN ('agency_owner', 'agency_member', 'agency_project_manager') THEN
            membership_type := 'agency';
        ELSE
            membership_type := 'unknown';
        END IF;
    END IF;

    -- Only create credits for client organizations
    IF membership_type = 'client' THEN
        INSERT INTO public.credits (
            agency_id,
            client_organization_id,
            balance,
            user_id
        ) VALUES (
            NEW.agency_id,
            NEW.organization_client_id,
            0,
            org_owner_id
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_credits_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Only process if the quantity is different from 0
    IF NEW.quantity != 0 THEN
        -- Update the balance according to the operation status
        IF NEW.status = 'consumed' THEN
            -- Subtract credits
            UPDATE public.credits 
            SET 
                balance = balance - NEW.quantity,
                updated_at = now()
            WHERE id = NEW.credit_id;
        ELSIF NEW.status IN ('purchased', 'refunded') THEN
            -- Add credits
            UPDATE public.credits 
            SET 
                balance = balance + NEW.quantity,
                updated_at = now()
            WHERE id = NEW.credit_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_order(_order jsonb, _brief_responses jsonb[], _order_followers text[], _order_file_ids uuid[], _organization_id uuid DEFAULT NULL::uuid, _user_id uuid DEFAULT NULL::uuid, _user_role text DEFAULT NULL::text)
 RETURNS orders_v2
 LANGUAGE plpgsql
AS $function$DECLARE
  new_order public.orders_v2;  -- Declare new_order as a record of type orders_v2
  current_user_id uuid := COALESCE(_user_id, auth.uid());  -- Get the authenticated user's ID
  user_role text;  -- To store the current user's role
  subdomain_id uuid;  -- To store the subdomain ID
  org_id uuid;  -- To store the organization ID from subdomain
  client_data record;  -- To hold client data
  agency_organization_data record;  -- To hold agency organization data
  agency_client_id uuid;  -- To hold the agency client ID
  client_organization_id uuid;  -- To hold the client organization ID
  brief_ids uuid[];  -- Array to hold brief IDs
  agencyRoles text[] := ARRAY['agency_owner', 'agency_member', 'agency_project_manager'];  -- List of agency roles
  clientRoles text[] := ARRAY['client_owner', 'client_member'];  -- List of client roles
  all_followers text[];  -- Array to hold all followers
  default_status_id integer;  -- To hold the default status ID
  new_position integer;  -- To hold the new position
  credit_operation_id uuid;  -- To hold credit operation ID for client orders
BEGIN
  -- Step 0: Verify the user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated';
  END IF;
  
  -- Step 0.1: Verify organization_id is not empty
  SELECT COALESCE(_organization_id, get_current_organization_id()) INTO org_id;
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'Organization not found for subdomain';
  END IF;
  
  -- Step 0.4: Get user role for this organization
  SELECT COALESCE(_user_role, am.account_role) INTO user_role
  FROM public.accounts_memberships am
  WHERE am.user_id = current_user_id
  AND am.organization_id = org_id
  LIMIT 1;
  
  IF user_role IS NULL THEN
    RAISE EXCEPTION 'User does not have a role in this organization';
  END IF;

  -- Step 0.5: Check _order_followers and use its first value if it exists
  IF array_length(_order_followers, 1) IS NULL THEN
    _order_followers := ARRAY[current_user_id::text];  -- Default to current_user_id if _order_followers is empty
  END IF;

  -- Step 0.6: Get client data using the first value of _order_followers if present
  SELECT * INTO client_data
  FROM public.clients
  WHERE user_client_id = COALESCE(_order_followers[1]::uuid, current_user_id)
  LIMIT 1;

  -- Step 0.7: Determine agency_client_id and client_organization_id
  IF user_role = ANY(agencyRoles) THEN
    -- User is from agency
    agency_client_id := org_id;
    client_organization_id := COALESCE(client_data.organization_client_id, org_id);
  ELSE
    -- User is from client
    client_organization_id := org_id;
    
    -- Find the agency that this client belongs to
    SELECT agency_id INTO agency_client_id
    FROM public.clients
    WHERE organization_client_id = org_id
    LIMIT 1;
    
    IF agency_client_id IS NULL THEN
      -- If no agency found, use the client's organization
      agency_client_id := org_id;
    END IF;
  END IF;

  -- Step 0.8: Get agency organization data
  SELECT o.id, o.owner_id, o.name INTO agency_organization_data
  FROM public.organizations o
  WHERE o.id = agency_client_id
  LIMIT 1;

  -- Step 0.9: Get default status ID
  SELECT id INTO default_status_id
  FROM public.agency_statuses
  WHERE status_name = 'in_review'
  AND agency_id = agency_organization_data.id
  LIMIT 1;

  -- Step 0.10: If no status found, set default status_id to 1
  IF default_status_id IS NULL THEN
    default_status_id := 1;
  END IF;

  -- Step 0.11: Calculate the new position
  SELECT COALESCE(MAX(position), 0) + 1 INTO new_position
  FROM public.orders_v2
  WHERE status_id = default_status_id
  AND agency_id = agency_organization_data.id;

  -- Step 0.12: Prepare the order for insertion
  brief_ids := ARRAY(
    SELECT (response_item->>'brief_id')::uuid
    FROM unnest(_brief_responses) AS response_item
  );
  
  -- Construct the orderToInsert object
  _order := jsonb_set(_order, '{customer_id}', to_jsonb(COALESCE(_order_followers[1]::uuid, current_user_id::uuid)));
  _order := jsonb_set(_order, '{client_organization_id}', to_jsonb(client_organization_id::text));
  _order := jsonb_set(_order, '{propietary_organization_id}', to_jsonb(agency_organization_data.owner_id::text));
  _order := jsonb_set(_order, '{agency_id}', to_jsonb(agency_organization_data.id::text));
  _order := jsonb_set(_order, '{brief_ids}', to_jsonb(brief_ids));
  _order := jsonb_set(_order, '{position}', to_jsonb(new_position::int));

  -- Step 0.13: Create credit operation for client orders
  IF user_role = ANY(clientRoles) THEN
    -- First, find or create the credits record for this client organization
    DECLARE 
      target_credit_id uuid;
    BEGIN
      -- Get the credit_id for this client organization
      SELECT id INTO target_credit_id
      FROM public.credits 
      WHERE client_organization_id = client_organization_id AND agency_id = agency_client_id
      AND deleted_on IS NULL
      LIMIT 1;
      
      -- If no credits record exists, create one
      IF target_credit_id IS NULL THEN
        INSERT INTO public.credits (
          agency_id,
          client_organization_id,
          balance,
          user_id
        ) VALUES (
          agency_client_id,
          client_organization_id,
          0,
          current_user_id
        ) RETURNING id INTO target_credit_id;
      END IF;
      
      -- Now create the credit operation
      INSERT INTO public.credit_operations (
        actor_id,
        status,
        type,
        quantity,
        description,
        credit_id,
        metadata
      ) VALUES (
        current_user_id,
        'consumed',
        'user',
        0,
        'Order creation credit consumption',
        target_credit_id,
        jsonb_build_object(
          'order_title', _order->>'title',
          'created_by', current_user_id
        )
      ) RETURNING id INTO credit_operation_id;
    END;
  END IF;

  -- Step 1: Insert the order into orders_v2
  INSERT INTO public.orders_v2 (
    agency_id,
    brief_ids,
    client_organization_id,
    created_at,
    customer_id,
    description,
    due_date,
    priority,
    propietary_organization_id,
    status,
    title,
    uuid,
    status_id,
    position,
    brief_id,
    credit_operation_id
  )
  VALUES (
    COALESCE(NULLIF(_order->>'agency_id', '')::uuid, NULL),
    COALESCE(
      ARRAY(
        SELECT elem::uuid
        FROM jsonb_array_elements_text(_order->'brief_ids') AS elem
      ),
      '{}'::uuid[]
    ),
    (_order->>'client_organization_id')::uuid,
    NOW(),
    (_order->>'customer_id')::uuid,
    _order->>'description',
    COALESCE(NULLIF(_order->>'due_date', ''), NULL)::timestamp with time zone,
    COALESCE(_order->>'priority', 'low')::priority_types,
    (_order->>'propietary_organization_id')::uuid,
    COALESCE(_order->>'status', 'in_review'),
    _order->>'title',
    _order->>'uuid',
    default_status_id,
    new_position,
    CASE 
      WHEN array_length(brief_ids, 1) > 0 THEN brief_ids[1]
      ELSE NULL
    END,
    credit_operation_id
  )
  RETURNING * INTO new_order;

  -- Step 2: Insert brief responses if present
  IF _brief_responses IS NOT NULL AND array_length(_brief_responses, 1) > 0 THEN
    INSERT INTO public.brief_responses (
      order_id,
      form_field_id,
      brief_id,
      response
    )
    SELECT
      new_order.uuid,
      (response_item->>'form_field_id')::uuid,
      (response_item->>'brief_id')::uuid,
      response_item->>'response'
    FROM unnest(_brief_responses) AS response_item;
  END IF;

  -- Step 3: Insert order files if present
  IF _order_file_ids IS NOT NULL AND array_length(_order_file_ids, 1) > 0 THEN
    INSERT INTO public.order_files (
      order_id,
      file_id
    )
    SELECT
      new_order.uuid,
      file_id
    FROM unnest(_order_file_ids) AS file_id;
  END IF;

  -- Step 4: Assign agency members to the order if role matches
  IF user_role = ANY (agencyRoles) THEN
    INSERT INTO public.order_assignations (
      agency_member_id,
      order_id
    )
    VALUES (
      current_user_id,
      new_order.id
    );
  END IF;

  -- Step 5: Determine initial follower based on client role and insert order followers
  IF user_role = ANY (clientRoles) THEN
    -- Only append _order_followers[1] if it is not already in the array
    all_followers := ARRAY(
      SELECT DISTINCT unnest(array_append(_order_followers, COALESCE(_order_followers[1]::text, current_user_id::text)))
    );
  ELSE
    all_followers := _order_followers;
  END IF;

  -- Step 6: Insert all followers if present
  IF array_length(all_followers, 1) > 0 THEN
    INSERT INTO public.order_followers (
      order_id,
      client_member_id
    )
    SELECT
      new_order.id,
      follower_id::uuid
    FROM unnest(all_followers) AS follower_id;
  END IF;

  -- Return the newly created order record
  RETURN new_order;
END;$function$
;

create or replace view "public"."user_organization" as  WITH session_data AS (
         SELECT get_session() AS session_info
        ), org_info AS (
         SELECT (sd.session_info).organization.id AS id,
            (sd.session_info).organization.name AS name,
            (sd.session_info).organization.slug AS slug,
            (sd.session_info).organization.owner_id AS owner_id,
            (sd.session_info).organization.role AS role,
                CASE
                    WHEN (((sd.session_info).organization.role)::text = ANY ((ARRAY['client_member'::character varying, 'client_owner'::character varying, 'client_guest'::character varying])::text[])) THEN ((sd.session_info).agency.owner_id)::uuid
                    ELSE ((sd.session_info).organization.owner_id)::uuid
                END AS plugin_owner_id
           FROM session_data sd
        )
 SELECT o.id,
    oi.name,
    oi.slug,
    o.picture_url,
    (oi.owner_id)::uuid AS owner_id,
    jsonb_build_object('enable_credits',
        CASE
            WHEN ((ap.deleted_on IS NULL) AND (p.name = 'credits'::text)) THEN true
            ELSE false
        END) AS config
   FROM (((org_info oi
     JOIN organizations o ON ((o.id = (oi.id)::uuid)))
     LEFT JOIN account_plugins ap ON (((ap.account_id = oi.plugin_owner_id) AND (ap.deleted_on IS NULL))))
     LEFT JOIN plugins p ON (((p.id = ap.plugin_id) AND (p.name = 'credits'::text) AND (p.deleted_on IS NULL))))
  WHERE (oi.id IS NOT NULL);


grant delete on table "public"."credit_operations" to "anon";

grant insert on table "public"."credit_operations" to "anon";

grant references on table "public"."credit_operations" to "anon";

grant select on table "public"."credit_operations" to "anon";

grant trigger on table "public"."credit_operations" to "anon";

grant truncate on table "public"."credit_operations" to "anon";

grant update on table "public"."credit_operations" to "anon";

grant delete on table "public"."credit_operations" to "authenticated";

grant insert on table "public"."credit_operations" to "authenticated";

grant references on table "public"."credit_operations" to "authenticated";

grant select on table "public"."credit_operations" to "authenticated";

grant trigger on table "public"."credit_operations" to "authenticated";

grant truncate on table "public"."credit_operations" to "authenticated";

grant update on table "public"."credit_operations" to "authenticated";

grant delete on table "public"."credit_operations" to "service_role";

grant insert on table "public"."credit_operations" to "service_role";

grant references on table "public"."credit_operations" to "service_role";

grant select on table "public"."credit_operations" to "service_role";

grant trigger on table "public"."credit_operations" to "service_role";

grant truncate on table "public"."credit_operations" to "service_role";

grant update on table "public"."credit_operations" to "service_role";

grant delete on table "public"."credits" to "anon";

grant insert on table "public"."credits" to "anon";

grant references on table "public"."credits" to "anon";

grant select on table "public"."credits" to "anon";

grant trigger on table "public"."credits" to "anon";

grant truncate on table "public"."credits" to "anon";

grant update on table "public"."credits" to "anon";

grant delete on table "public"."credits" to "authenticated";

grant insert on table "public"."credits" to "authenticated";

grant references on table "public"."credits" to "authenticated";

grant select on table "public"."credits" to "authenticated";

grant trigger on table "public"."credits" to "authenticated";

grant truncate on table "public"."credits" to "authenticated";

grant update on table "public"."credits" to "authenticated";

grant delete on table "public"."credits" to "service_role";

grant insert on table "public"."credits" to "service_role";

grant references on table "public"."credits" to "service_role";

grant select on table "public"."credits" to "service_role";

grant trigger on table "public"."credits" to "service_role";

grant truncate on table "public"."credits" to "service_role";

grant update on table "public"."credits" to "service_role";

create policy "credit_operations_delete"
on "public"."credit_operations"
as permissive
for delete
to authenticated
using (true);


create policy "credit_operations_write"
on "public"."credit_operations"
as permissive
for insert
to authenticated
with check (true);


create policy "credit_operations_read"
on "public"."credit_operations"
as permissive
for select
to authenticated
using (true);


create policy "credit_operations_update"
on "public"."credit_operations"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "credits_delete"
on "public"."credits"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), credits.agency_id) AND has_permission(auth.uid(), credits.agency_id, 'credits.delete'::app_permissions) AND (credits.agency_id = (sess.session).organization_id)))));


create policy "credits_read"
on "public"."credits"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), credits.agency_id) AND has_permission(auth.uid(), credits.agency_id, 'credits.read'::app_permissions) AND (credits.agency_id = (sess.session).organization_id)))) OR (EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_client_organization(auth.uid(), credits.client_organization_id) AND has_permission(auth.uid(), credits.client_organization_id, 'credits.read'::app_permissions) AND (credits.agency_id = (sess.session).agency_id))))));


create policy "credits_update"
on "public"."credits"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), credits.agency_id) AND has_permission(auth.uid(), credits.agency_id, 'credits.manage'::app_permissions) AND (credits.agency_id = (sess.session).organization_id)))));


create policy "credits_write"
on "public"."credits"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), credits.agency_id) AND has_permission(auth.uid(), credits.agency_id, 'credits.write'::app_permissions) AND (credits.agency_id = (sess.session).organization_id)))));


CREATE TRIGGER handle_new_client_credits_trigger AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION handle_new_client_credits();

CREATE TRIGGER update_credits_balance_after_insert AFTER INSERT ON public.credit_operations FOR EACH ROW EXECUTE FUNCTION update_credits_balance();

CREATE TRIGGER update_credits_balance_after_update AFTER UPDATE OF quantity, status ON public.credit_operations FOR EACH ROW WHEN (((old.quantity IS DISTINCT FROM new.quantity) OR (old.status IS DISTINCT FROM new.status))) EXECUTE FUNCTION update_credits_balance();